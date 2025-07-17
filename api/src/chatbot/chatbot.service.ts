import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly endpoint: string;
  private readonly deployment: string;
  private readonly apiKey: string;
  private readonly apiVersion = '2024-05-01';

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config.get<string>('AZURE_OPENAI_ENDPOINT')!;
    this.deployment = this.config.get<string>('AZURE_OPENAI_DEPLOYMENT')!;
    this.apiKey = this.config.get<string>('AZURE_OPENAI_KEY')!;
  }

  async sendMessage(message: string): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

    const payload = {
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful medical assistant for patients and doctors.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    };

    const headers = {
      'Content-Type': 'application/json',
      'api-key': this.apiKey,
    };

    interface OpenAIChatResponse {
      choices: {
        message: {
          content: string;
        };
      }[];
    }

    try {
      const response = await axios.post<OpenAIChatResponse>(url, payload, {
        headers,
      });
      return response.data.choices[0].message.content;
    } catch (error: any) {
      this.logger.error('Error sending message to Azure OpenAI:', error);
      return "I'm currently unavailable. Please try again later.";
    }
  }
}
