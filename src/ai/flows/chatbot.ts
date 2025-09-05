'use server';

/**
 * @fileOverview A chatbot flow that responds to user messages.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {MessageData} from 'genkit/model';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export type ChatOutput = AsyncGenerator<string>;

export async function* chat(input: ChatInput): ChatOutput {
  const {history, message} = input;
  const {stream} = ai.generateStream({
    history: history.map(
      h =>
        ({
          role: h.role,
          content: [{text: h.content}],
        } as MessageData)
    ),
    prompt: message,
  });

  for await (const chunk of stream) {
    yield chunk.text ?? '';
  }
}
