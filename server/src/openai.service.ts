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
You are a support ticket triage assistant. Given the following ticket, assign a priority ("high", "medium", or "low"), provide a one-sentence summary, and generate a solution-oriented response message.

Subject: ${subject}
Description: ${description}

Your task:
1. Analyze the customer's issue
2. Provide an actual solution or helpful answer (not just a template)
3. Format it as a ready-to-send message that support staff can use directly or edit

The response should:
- Address the customer's specific issue with a solution or helpful guidance
- Be professional, empathetic, and clear
- Be ready to send (not a template - include actual solutions/answers)
- Be concise but complete (3-5 sentences typically)
- If the issue requires investigation, provide next steps and timeline

Respond in JSON:
{
  "priority": "high|medium|low",
  "summary": "...",
  "suggested_response": "A complete, solution-oriented message ready to send to the customer. Include actual solutions, not just placeholders."
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
