'use server';

/**
 * @fileOverview Analyzes parking data and alerts users to alternative parking when unusual crowding is detected.
 *
 * - analyzeParkingCrowding - A function that analyzes parking data and suggests alternative parking.
 * - AnalyzeParkingCrowdingInput - The input type for the analyzeParkingCrowding function.
 * - AnalyzeParkingCrowdingOutput - The return type for the analyzeParkingCrowding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeParkingCrowdingInputSchema = z.object({
  parkingData: z
    .string()
    .describe(
      'A string containing the current parking data, including occupancy rates and locations.'
    ),
});
export type AnalyzeParkingCrowdingInput = z.infer<
  typeof AnalyzeParkingCrowdingInputSchema
>;

const AnalyzeParkingCrowdingOutputSchema = z.object({
  isCrowded: z.boolean().describe('Whether unusual crowding is detected.'),
  suggestedAlternatives: z
    .string()
    .describe(
      'A list of suggested alternative parking locations, if crowding is detected.'
    ),
});
export type AnalyzeParkingCrowdingOutput = z.infer<
  typeof AnalyzeParkingCrowdingOutputSchema
>;

export async function analyzeParkingCrowding(
  input: AnalyzeParkingCrowdingInput
): Promise<AnalyzeParkingCrowdingOutput> {
  return analyzeParkingCrowdingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeParkingCrowdingPrompt',
  input: {schema: AnalyzeParkingCrowdingInputSchema},
  output: {schema: AnalyzeParkingCrowdingOutputSchema},
  prompt: `You are an AI assistant that analyzes parking data to detect unusual crowding and suggest alternative parking locations.

  Analyze the following parking data:
  {{parkingData}}

  Determine if there is unusual crowding based on the occupancy rates and historical data. If crowding is detected, suggest alternative parking locations.

  The output should be formatted as a JSON object with the following keys:
  - isCrowded: true if unusual crowding is detected, false otherwise.
  - suggestedAlternatives: a comma-separated list of alternative parking locations, or an empty string if no alternatives are available.
  \n  Make sure to set suggestedAlternatives to an empty string if no alternatives are available.
  `,
});

const analyzeParkingCrowdingFlow = ai.defineFlow(
  {
    name: 'analyzeParkingCrowdingFlow',
    inputSchema: AnalyzeParkingCrowdingInputSchema,
    outputSchema: AnalyzeParkingCrowdingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
