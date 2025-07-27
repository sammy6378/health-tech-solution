import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Content,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ChatMessage } from 'src/types/model';
import { Role } from 'src/users/dto/create-user.dto';
import { AiQueryService } from 'src/ai-tool/service/select-services';

@Injectable()
export class ChatappService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiQueryService: AiQueryService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async handleRequest(messages: ChatMessage[], res: Response): Promise<void> {
    const keepAlive = setInterval(() => res.write(':keep-alive\n\n'), 15000);

    try {
      const stream = await this.generateResponse(messages);

      console.log('stream', stream);

      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of stream) {
        const text = chunk.text();
        if (text) res.write(text);
      }

      res.end();
    } catch (error) {
      console.error('Generation error during streaming:', error);
      if (!res.headersSent) {
        res.status(500).write('Error generating response. Please try again.');
      } else {
        res.write('\nError generating response. Please try again.\n');
      }
      res.end();
    } finally {
      clearInterval(keepAlive);
    }
  }

  async handleRequestWithPatientContext(
    messages: ChatMessage[],
    res: Response,
    userId: string,
  ): Promise<void> {
    const keepAlive = setInterval(() => res.write(':keep-alive\n\n'), 15000);

    try {
      // Create a copy of messages to avoid mutating the original
      const enrichedMessages = [...messages];

      // Enrich prompt with patient data queries
      const queryResult = await this.handleQueryConversation(
        enrichedMessages,
        userId,
      );

      console.log('Query result:', queryResult);

      // Generate final response with enriched context
      const stream = await this.generateResponse(enrichedMessages, userId);

      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of stream) {
        const text = chunk.text();
        if (text) res.write(text);
      }

      res.end();
    } catch (error) {
      console.error('Generation error during streaming:', error);
      if (!res.headersSent) {
        res.status(500).write('Error generating response. Please try again.');
      } else {
        res.write('\nError generating response. Please try again.\n');
      }
      res.end();
    } finally {
      clearInterval(keepAlive);
    }
  }

  // ----------------------------
  // Query injection before AI call
  // ----------------------------
  private async handleQueryConversation(
    messages: ChatMessage[],
    userId?: string,
  ): Promise<{ summary: string; data: any } | null> {
    console.log('user id for query', userId);

    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === 'user')?.content;

    if (!lastUserMessage) return null;

    try {
      // For platform-wide queries (doctors, stock), don't require userId
      const queryResult = await this.aiQueryService.handleQuery(
        userId || 'platform', // Use 'platform' for non-user-specific queries
        Role.PATIENT,
        lastUserMessage,
      );

      console.log('Raw query result:', queryResult);

      if (queryResult && queryResult.summary) {
        const lastUserMessageIndex = messages.length - 1;
        const originalMessage = messages[lastUserMessageIndex].content;

        const contextualMessage = this.createContextualMessage(
          originalMessage,
          queryResult,
          userId,
        );

        messages[lastUserMessageIndex] = {
          role: 'user',
          content: contextualMessage,
        };

        console.log('Enhanced message:', messages[lastUserMessageIndex]);
        return queryResult;
      }

      return null;
    } catch (error) {
      console.error('Error in handleQueryConversation:', error);
      return null;
    }
  }

  private createContextualMessage(
    originalMessage: string,
    queryResult: { summary: string; data: unknown } | null,
    userId?: string,
  ): string {
    const hasData =
      queryResult &&
      typeof queryResult === 'object' &&
      'data' in queryResult &&
      (Array.isArray(queryResult.data)
        ? (queryResult.data as unknown[]).length > 0
        : queryResult.data !== null && queryResult.data !== undefined);

    if (hasData && queryResult) {
      // Determine if this is platform data or personal data
      const isPersonalData =
        userId &&
        (originalMessage.toLowerCase().includes('my ') ||
          originalMessage.toLowerCase().includes('appointment') ||
          originalMessage.toLowerCase().includes('order') ||
          originalMessage.toLowerCase().includes('payment'));

      if (isPersonalData) {
        return `Based on your MediConnect account data: ${queryResult.summary}

User's question: ${originalMessage}

Please provide a helpful response based on this personal information and answer their question directly.`;
      } else {
        return `Based on MediConnect platform data: ${queryResult.summary}

User's question: ${originalMessage}

Please provide a helpful response showing what's available on the platform and answer their question directly.`;
      }
    } else if (queryResult) {
      return `I searched MediConnect but ${queryResult.summary}

User's question: ${originalMessage}

Please provide helpful guidance and suggest alternatives.`;
    } else {
      return `User's question: ${originalMessage}

Please provide helpful guidance and suggest alternatives.`;
    }
  }

  private async generateResponse(messages: ChatMessage[], userId?: string) {
    console.log('Generating response for user:', userId);
    console.log('Messages:', JSON.stringify(messages, null, 2));

    const modelName = 'gemini-1.5-flash';

    const transformedMessages: Content[] = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const systemInstruction: Content = {
      role: 'user',
      parts: [{ text: this.getSystemPrompt(userId) }],
    };

    console.log('Transformed messages count:', transformedMessages.length);

    const model: GenerativeModel = this.genAI.getGenerativeModel({
      model: modelName,
    });

    const response = await model.generateContentStream({
      contents: transformedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40,
      },
      systemInstruction,
    });

    return response.stream as AsyncIterable<{ text(): string }>;
  }

  // system instructions
  private getSystemPrompt(userId?: string): string {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
    const currentDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); // e.g., "July 27, 2025"

    let basePrompt = `You are a helpful and professional medical assistant at MediConnect. Your role is to provide informative, concise, and empathetic responses to users' health-related questions.

CURRENT DATE AND TIME:
- Today is ${currentDay}, ${currentDate}
- When asked about "today" or "available today", compare with the doctors' available days
- If a doctor's days include "${currentDay}" or variations like "${currentDay.toLowerCase()}" or "${currentDay.substring(0, 3)}", they are available today

Response Guidelines:

Formatting Rules:
- Write in plain text only - NO markdown formatting, NO bold text (**text**), NO headings (#), NO italic text (*text*), and NO HTML tags
- Do not use asterisks (*), hashtags (#), underscores (_), or any special formatting characters
- Write responses as simple paragraphs and numbered lists using regular text only
- When mentioning links, write them naturally in plain text without HTML tags

Content Guidelines:
- Use the provided MediConnect knowledge base as your primary source for platform-related questions
- When asked about doctor availability, use the availability and days information provided in the context
- If specific availability times are mentioned, provide them clearly to the user
- For real-time scheduling, always direct users to the MediConnect appointment booking system
- Respond quickly and to the point - avoid long introductions
- Use a warm, professional tone while keeping responses concise
- ONLY recommend MediConnect services and doctors - do not suggest external platforms, other websites, or third-party services

Medical Guidelines:
- Never provide specific diagnoses or treatment recommendations
- Always remind users to consult a licensed healthcare professional for medical concerns
- For urgent symptoms, advise users to seek immediate medical attention or visit an emergency room
- Focus on general health information and MediConnect platform guidance
- Do not recommend external medical platforms, telehealth services, or other appointment systems

PLATFORM LIMITATIONS:
- You can ONLY help with MediConnect doctors, services, and appointments
- If a doctor is not available today, suggest checking their next available day on MediConnect
- If no suitable doctor is available, suggest contacting MediConnect support for assistance
- For urgent medical needs, direct users to emergency services, but do not recommend other medical platforms
- Never suggest external websites, apps, or competing medical services

IMPORTANT CONTEXT USAGE:
- DOCTORS & PHARMACY STOCK: These are platform-wide resources available to all users
- PERSONAL DATA: Appointments, orders, payments, diagnoses are user-specific
- When asked about doctors or medications, show ALL available options on the platform
- When asked about appointments/orders, only show the user's personal data
- DOCTOR AVAILABILITY: When availability and days information is provided in the context, share it with the user
- TODAY'S AVAILABILITY: Compare today's day (${currentDay}) with each doctor's available days to determine who is available today`;

    if (userId) {
      basePrompt += `

You are currently assisting patient ID: ${userId}. The CONTEXT provided contains:
1. PLATFORM DATA: All doctors and pharmacy stock available on MediConnect (for everyone)
2. PERSONAL DATA: Your specific appointments, orders, payments, and medical records

When answering:
- For doctor/medication questions: Use the platform-wide data to show ALL available options including availability schedules
- For appointment/order questions: Use only your personal data
- Always be clear about what's available on the platform vs. what's specific to this user
- When asked about today's availability, check if today (${currentDay}) matches any doctor's available days
- If requested services are not available today, suggest the next available appointment on MediConnect only`;
    } else {
      basePrompt += `

You are assisting a general user without access to personal account data. Show platform-wide information about doctors and medications, including availability schedules, but direct them to log in for personal medical records.
- When asked about today's availability, check if today (${currentDay}) matches any doctor's available days
- If requested services are not available today, suggest the next available appointment on MediConnect only`;
    }

    return basePrompt;
  }
}
