'use server';

/**
 * @fileOverview A tool for getting directions between two facilities.
 *
 * - getDirections - A Genkit tool that returns a URL with directions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {initialFacilities} from '@/lib/data';

const GetDirectionsInputSchema = z.object({
  start: z
    .string()
    .describe('The name of the starting facility. Must be one of the available facilities.'),
  destination: z
    .string()
    .describe('The name of the destination facility. Must be one of the available facilities.'),
});

export const getDirections = ai.defineTool(
  {
    name: 'getDirections',
    description:
      'Get directions between two facilities in Ujjain for Simhastha 2028.',
    inputSchema: GetDirectionsInputSchema,
    outputSchema: z.string().describe('A URL with the directions.'),
  },
  async ({start, destination}) => {
    const startFacility = initialFacilities.find(
      f => f.name.toLowerCase() === start.toLowerCase()
    );
    const destFacility = initialFacilities.find(
      f => f.name.toLowerCase() === destination.toLowerCase()
    );

    if (!startFacility || !destFacility) {
      let message = '';
      if (!startFacility)
        message += `Could not find starting location: ${start}. `;
      if (!destFacility)
        message += `Could not find destination location: ${destination}.`;
      
      const availableFacilities = initialFacilities.map(f => f.name).join(', ');
      message += `Available locations are: ${availableFacilities}`;
      
      return message;
    }

    const {
      position: {lat: fromLat, lng: fromLng},
    } = startFacility;
    const {
      position: {lat: toLat, lng: toLng},
    } = destFacility;

    return `https://www.openstreetmap.org/directions?route=${fromLat},${fromLng}%3B${toLat},${toLng}`;
  }
);
