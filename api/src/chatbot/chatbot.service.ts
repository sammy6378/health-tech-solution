import { Injectable } from '@nestjs/common';
import { NlpManager } from 'node-nlp';

@Injectable()
export class ChatbotService {
  private manager: NlpManager;

  constructor() {
    this.manager = new NlpManager({ languages: ['en'] });
    void this.trainModel();
  }

  private async trainModel() {
    // Add documents and intents
    this.manager.addDocument('en', 'hello', 'greeting');
    this.manager.addDocument('en', 'hi there', 'greeting');
    this.manager.addDocument('en', 'goodbye', 'farewell');
    this.manager.addDocument('en', 'see you later', 'farewell');
    this.manager.addDocument('en', 'help me', 'help');
    this.manager.addDocument('en', 'what can you do', 'help');

    // Add answers
    this.manager.addAnswer('en', 'greeting', 'Hello! How can I help you?');
    this.manager.addAnswer('en', 'greeting', 'Hi there!');
    this.manager.addAnswer('en', 'farewell', 'Goodbye!');
    this.manager.addAnswer('en', 'farewell', 'See you soon!');
    this.manager.addAnswer('en', 'help', 'I can answer basic questions');
    this.manager.addAnswer(
      'en',
      'help',
      'I provide information about our services',
    );

    // Train and save the model
    await this.manager.train();
    this.manager.save();
  }

  async getResponse(message: string): Promise<string> {
    const response = await this.manager.process('en', message);
    return response.answer || "I'm not sure how to respond to that.";
  }
}
