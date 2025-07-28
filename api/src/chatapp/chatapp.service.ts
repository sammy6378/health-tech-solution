import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Content,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ChatMessage } from 'src/types/model';

@Injectable()
export class ChatappService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Simplified handler without data querying
  async handleRequest(messages: ChatMessage[], res: Response): Promise<void> {
    const keepAlive = setInterval(() => res.write(':keep-alive\n\n'), 15000);

    try {
      const stream = await this.generateResponse(messages);

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

  // Handler that accepts pre-processed context from frontend
  async handleRequestWithContext(
    messages: ChatMessage[],
    res: Response,
    contextData?: any,
    userId?: string,
  ): Promise<void> {
    const keepAlive = setInterval(() => res.write(':keep-alive\n\n'), 15000);

    try {
      // If context data is provided, enrich the last message
      if (contextData && messages.length > 0) {
        const enrichedMessages = [...messages];
        const lastMessageIndex = enrichedMessages.length - 1;
        const lastMessage = enrichedMessages[lastMessageIndex];

        if (lastMessage.role === 'user') {
          enrichedMessages[lastMessageIndex] = {
            ...lastMessage,
            content: this.createContextualMessage(
              lastMessage.content,
              contextData,
            ),
          };
        }

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
      } else {
        // No context, just generate response normally
        const stream = await this.generateResponse(messages, userId);

        res.setHeader('X-Accel-Buffering', 'no');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of stream) {
          const text = chunk.text();
          if (text) res.write(text);
        }
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

  private createContextualMessage(
    originalMessage: string,
    contextData: any,
  ): string {
    // Don't add context for simple greetings or casual conversation
    if (this.isSimpleGreeting(originalMessage)) {
      return originalMessage;
    }

    if (
      contextData &&
      typeof contextData === 'object' &&
      'summary' in contextData &&
      typeof (contextData as { summary?: unknown }).summary === 'string'
    ) {
      const summary = (contextData as { summary: string }).summary;

      // Don't add medical context if the summary indicates no relevant data
      if (summary.includes('No ') && summary.includes('found')) {
        return `${summary}

User's question: ${originalMessage}

Please provide a helpful response and suggest alternatives if needed.`;
      }

      // Determine query type for more specific context
      const isDoctorQuery =
        originalMessage.toLowerCase().includes('doctor') ||
        originalMessage.toLowerCase().includes('dr.') ||
        /(?:do (?:you|we) have|is there|got any|have any)\s+(?:doctor|dr\.)\s*[a-zA-Z]/i.test(
          originalMessage,
        );

      const isStockQuery =
        originalMessage.toLowerCase().includes('stock') ||
        originalMessage.toLowerCase().includes('medicine') ||
        originalMessage.toLowerCase().includes('medication') ||
        originalMessage.toLowerCase().includes('drug') ||
        /(?:do (?:you|we) have|is there|got any|have any)\s+[a-zA-Z](?!.*doctor)/i.test(
          originalMessage,
        );

      const isPersonalQuery =
        originalMessage.toLowerCase().includes('my ') ||
        originalMessage.toLowerCase().includes('appointment') ||
        originalMessage.toLowerCase().includes('order') ||
        originalMessage.toLowerCase().includes('payment') ||
        originalMessage.toLowerCase().includes('diagnosis');

      if (isDoctorQuery) {
        return `MediConnect Doctor Information: ${summary}

User's question: ${originalMessage}

Please provide specific information about the requested doctor including their name, specialization, and availability. Focus only on doctor-related information.`;
      } else if (isStockQuery && !isPersonalQuery) {
        return `MediConnect Pharmacy Inventory: ${summary}

User's question: ${originalMessage}

Please provide information about what medications are available in our pharmacy for purchase. Do not refer to these as the user's personal medications.`;
      } else if (isPersonalQuery) {
        return `Based on your personal MediConnect account: ${summary}

User's question: ${originalMessage}

Please provide a helpful response based on this personal information and answer their question directly.`;
      } else {
        return `Based on MediConnect platform data: ${summary}

User's question: ${originalMessage}

Please provide a helpful response based on this information and answer their question directly.`;
      }
    }

    return originalMessage;
  }

  private isSimpleGreeting(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();

    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|good day)$/,
      /^(hi|hello|hey)\s*[!.]*$/,
      /^good\s+(morning|afternoon|evening|day)\s*[!.]*$/,
      /^how\s+(are\s+you|is\s+everything)[\s?!.]*$/,
      /^(thank\s+you|thanks|bye|goodbye|see\s+you)[\s!.]*$/,
      /^what\s+can\s+you\s+do[\s?!.]*$/,
      /^who\s+are\s+you[\s?!.]*$/,
      /^help[\s!.]*$/,
    ];

    return greetingPatterns.some((pattern) => pattern.test(lowerMessage));
  }

  private async generateResponse(messages: ChatMessage[], userId?: string) {
    console.log('Generating response for user:', userId);
    console.log('Messages count:', messages.length);

    const modelName = 'gemini-1.5-flash';

    const transformedMessages: Content[] = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const systemInstruction: Content = {
      role: 'user',
      parts: [{ text: this.getSystemPrompt(userId) }],
    };

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

  //   // system instructions
  private getSystemPrompt(userId?: string): string {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let basePrompt = `You are a helpful and professional medical assistant at MediConnect.

CURRENT DATE AND TIME:
- Today is ${currentDay}, ${currentDate}

CONVERSATION GUIDELINES:
- For simple greetings (hi, hello, good morning, etc.), respond warmly and briefly without mentioning medical data
- Only discuss medical information when the user specifically asks about health-related topics
- Keep greeting responses conversational and welcoming
- FOCUS ON THE SPECIFIC QUESTION ASKED - do not provide unrelated information

CONTEXT DATA TYPES:
1. PHARMACY INVENTORY: Medications available for purchase in our pharmacy
2. PERSONAL DATA: User's appointments, orders, diagnoses, prescriptions
3. PLATFORM DATA: Available doctors and general services

Response Guidelines:

Formatting Rules:
- Write in plain text only - NO markdown formatting, NO bold text, NO headings, NO HTML tags
- Do not use asterisks (*), hashtags (#), underscores (_), or any special formatting characters
- Write responses as simple paragraphs and numbered lists using regular text only

Content Guidelines:
- ANSWER ONLY THE SPECIFIC QUESTION ASKED - do not add unrelated information
- For greetings: Be warm and welcoming, ask how you can help with their health questions
- For doctor queries: Provide specific information about the requested doctor including name, specialization, availability
- For pharmacy stock queries: Present specific information about the requested medication
- For personal data queries: Use the provided context to give specific, helpful responses
- Use a warm, professional tone while keeping responses concise and focused
- ONLY recommend MediConnect services and doctors

DOCTOR QUERY RESPONSES:
- When asked about a specific doctor, provide their full name, specialization, and availability if found
- If doctor is not found, clearly state they are not available
- Include booking information if the doctor is available
- Do not mention unrelated topics like pharmacy stock when answering doctor questions

PHARMACY STOCK RESPONSES:
- When discussing pharmacy inventory, say "we have" or "available in our pharmacy"
- Never say "you have" when referring to pharmacy stock
- Present medications as available for purchase or prescription
- Include pricing and quantity if available
- Suggest consulting with a doctor for prescriptions
- Do not mention doctors when answering medication questions unless specifically asked

Medical Guidelines:
- Never provide specific diagnoses or treatment recommendations
- Always remind users to consult a licensed healthcare professional for medical concerns
- For urgent symptoms, advise users to seek immediate medical attention
- Focus on general health information and MediConnect platform guidance
- Stay focused on the user's specific question without adding unrelated medical advice`;

    if (userId) {
      basePrompt += `

You are currently assisting patient ID: ${userId}.
- For casual conversation: Respond naturally without mentioning medical data
- For health questions: Use the provided context to give personalized responses
- For pharmacy stock: Present as available inventory, not personal medications
- For doctor queries: Provide specific doctor information and availability
- Always be clear about what information is pharmacy inventory vs. personal medical data
- STAY FOCUSED on answering the specific question asked`;
    }

    return basePrompt;
  }
}
