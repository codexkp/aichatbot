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
import {getDirections} from '../tools/routing';
import {initialFacilities} from '@/lib/data';
import type { Position } from '@/types';

const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ),
  message: z.string(),
  userPosition: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
    text: z.string().describe("The textual response to the user's message."),
    facilityId: z.string().optional().describe("The ID of the facility to highlight on the map, if the user asked for a location."),
});

export type ChatOutput = AsyncGenerator<z.infer<typeof ChatOutputSchema>>;


export async function* chat(input: ChatInput): ChatOutput {
  const {history, message, userPosition} = input;

  const facilityList = initialFacilities.map(f => f.name).join(', ');

  let systemPrompt = `You are a helpful assistant for the Simhastha 2028 event in Ujjain.
    The user may ask for directions. If so, use the getDirections tool.
    If the user asks to find a specific facility, provide a helpful text response and also output the facility's ID in the facilityId field.
    The available facilities are: ${facilityList}. You must only use facilities from this list.
    The ID for each facility is its name, but in snake_case with an underscore and a number at the end (e.g., 'Ramghat Parking' is 'park_1', 'Anjushree Hotel' is 'hotel_1').
    Here are the facility names and their corresponding IDs:
    ${initialFacilities.map(f => `- ${f.name}: ${f.id}`).join('\n')}
    `;

  if (userPosition) {
    systemPrompt += `\nThe user's current location is available and is at ${userPosition.lat},${userPosition.lng}. When the user asks for directions from 'here' or their 'current location', use these coordinates as the starting point. This is the priority starting point.`;
  } else {
    systemPrompt += `\nThe user's location has not been shared. If the user asks for directions without specifying a starting point, you must ask them for a starting facility from the available list. Do not try to guess their location.`;
  }

  const {stream} = ai.generateStream({
    history: history.map(
      h =>
        ({
          role: h.role,
          content: [{text: h.content}],
        } as MessageData)
    ),
    prompt: message,
    tools: [getDirections],
    system: systemPrompt,
    output: {
        schema: ChatOutputSchema
    }
  });

  for await (const chunk of stream) {
    if (chunk.output) {
      yield chunk.output;
    }
  }
}
