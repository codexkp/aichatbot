"use client";

import * as React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, MapControl, ControlPosition } from '@vis.gl/react-google-maps';
import type { AnyFacility } from '@/types';
import { MapMarker } from './map-marker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import { Skeleton } from './ui/skeleton';

interface MapViewProps {
  facilities: AnyFacility[];
  onSelectFacility: (facility: AnyFacility) => void;
  selectedFacility: AnyFacility | null;
}

const ujjainCenter = { lat: 23.1793, lng: 75.7849 };

export function MapView({ facilities, onSelectFacility, selectedFacility }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isMobile = useIsMobile();
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    if (map && selectedFacility) {
      map.panTo(selectedFacility.position);
    }
  }, [selectedFacility, map]);

  if (!apiKey || apiKey === 'DUMMY_API_KEY_REPLACE_ME') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 p-4">
        <div className="text-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12">
          <h3 className="font-headline text-2xl text-muted-foreground">Map Unavailable</h3>
          <p className="text-muted-foreground mt-2">
            A valid Google Maps API key is not configured.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-4">
            Please add <code className="bg-muted-foreground/20 p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        ref={setMap}
        defaultCenter={ujjainCenter}
        defaultZoom={13}
        gestureHandling={isMobile ? 'cooperative' : 'greedy'}
        disableDefaultUI={true}
        className='w-full h-full'
      >
        {facilities.map((facility) => (
          <AdvancedMarker
            key={facility.id}
            position={facility.position}
            onClick={() => onSelectFacility(facility)}
          >
            <MapMarker facility={facility} isSelected={selectedFacility?.id === facility.id} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
