
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
      'A comma-separated list of suggested alternative parking locations, if crowding is detected. Should only include locations that are not already crowded.'
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

  Analyze the following parking data which is in the format 'Name: occupancy/capacity (status)':
  {{parkingData}}

  A parking lot is considered 'crowded' if its status is 'crowded'.
  If you detect any crowded parking lots, set isCrowded to true.
  If isCrowded is true, suggest 2-3 alternative parking locations from the list that are not themselves crowded.
  The suggested alternatives should be a comma-separated string of names.
  If no crowding is detected, set isCrowded to false and suggestedAlternatives to an empty string.
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

    