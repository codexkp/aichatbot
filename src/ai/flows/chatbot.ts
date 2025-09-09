
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

const RouteInfoSchema = z.object({
    start: z.object({ lat: z.number(), lng: z.number() }),
    destination: z.object({ lat: z.number(), lng: z.number() }),
});

const ChatOutputSchema = z.object({
    text: z.string().describe("The textual response to the user's message."),
    facilityId: z.string().optional().describe("The ID of the facility to highlight on the map, if the user asked for a location."),
    route: RouteInfoSchema.optional().describe("The route to display on the map if the user asked for directions."),
});

export type ChatOutput = AsyncGenerator<z.infer<typeof ChatOutputSchema>>;


export async function* chat(input: ChatInput): ChatOutput {
  const {history, message, userPosition} = input;

  const facilityList = initialFacilities.map(f => f.name).join(', ');

  let systemPrompt = `You are a helpful assistant for the Simhastha 2028 event in Ujjain.
    Your output MUST be a JSON object that conforms to the output schema. For simple text responses, you must still output a JSON object with the 'text' field populated.
    You must respond in the same language as the user's message. You support English, Hindi, Hinglish, Marathi, Bangla, Gujarati, Tamil, Telugu, Kannada, Punjabi, Bhojpuri, and Odia.
    The user may ask for directions. If so, use the getDirections tool. When you use the getDirections tool, take the message from the tool's output and use it as your main text response. Also, pass the route object from the tool's output into the route field of your response.
    If the user asks to find a specific facility, provide a helpful text response and also output the facility's ID in the facilityId field.
    The available facilities are: ${facilityList}. You must only use facilities from this list.
    The ID for each facility is its name, but in snake_case with an underscore and a number at the end (e.g., 'Ramghat Parking' is 'park_1', 'Anjushree Hotel' is 'hotel_1', 'Mahakaleshwar Temple' is 'temple_1').
    Here are the facility names and their corresponding IDs:
    ${initialFacilities.map(f => `- ${f.name}: ${f.id}`).join('\n')}
    `;

  if (userPosition) {
    systemPrompt += `\nThe user's current location is available at ${userPosition.lat},${userPosition.lng}. For any route request, ALWAYS use these coordinates as the starting point. Do not ask for a starting location.`;
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
    } else if (chunk.toolRequest) {
      // If there's a tool request but no immediate text output, we can still yield a placeholder
      yield { text: '' };
    }
  }
}
