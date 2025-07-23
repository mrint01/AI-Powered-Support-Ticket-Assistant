import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async prioritizeAndSummarize(subject: string, description: string) {
    const prompt = `
You are a support ticket triage assistant. Given the following ticket, assign a priority ("high", "medium", or "low") and provide a one-sentence summary.

Subject: ${subject}
Description: ${description}

Respond in JSON:
{
  "priority": "high|medium|low",
  "summary": "..."
}
    `.trim();

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });
      const text = completion.choices[0].message?.content || '';
      return JSON.parse(text);
    } catch (e: any) {
      // Log the full error response
      console.error('OpenAI API error:', e.response?.data || e.message || e);
      throw new Error(
        'OpenAI API error: ' + (e.response?.data?.error?.message || e.message),
      );
    }
  }
}
