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
    .describe('The name of the starting facility or the coordinates (lat,lng) of the starting location. Must be one of the available facilities if a name is provided.'),
  destination: z
    .string()
    .describe('The name of the destination facility. Must be one of the available facilities.'),
});

export const getDirections = ai.defineTool(
  {
    name: 'getDirections',
    description:
      'Get directions between two locations in Ujjain for Simhastha 2028. The start location can be a facility name or a latitude,longitude string.',
    inputSchema: GetDirectionsInputSchema,
    outputSchema: z.string().describe('A URL with the directions.'),
  },
  async ({start, destination}) => {
    let fromLat: number, fromLng: number;

    // Check if start is coordinates
    const coords = start.split(',').map(Number);
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        [fromLat, fromLng] = coords;
    } else {
        const startFacility = initialFacilities.find(
          f => f.name.toLowerCase() === start.toLowerCase()
        );
        if (!startFacility) {
            let message = `Could not find starting location: ${start}. `;
            const availableFacilities = initialFacilities.map(f => f.name).join(', ');
            message += `Available locations are: ${availableFacilities}`;
            return message;
        }
        fromLat = startFacility.position.lat;
        fromLng = startFacility.position.lng;
    }

    const destFacility = initialFacilities.find(
      f => f.name.toLowerCase() === destination.toLowerCase()
    );

    if (!destFacility) {
      let message = `Could not find destination location: ${destination}.`;
      const availableFacilities = initialFacilities.map(f => f.name).join(', ');
      message += `Available locations are: ${availableFacilities}`;
      return message;
    }

    const {
      position: {lat: toLat, lng: toLng},
    } = destFacility;

    return `https://www.openstreetmap.org/directions?route=${fromLat},${fromLng}%3B${toLat},${toLng}`;
  }
);
