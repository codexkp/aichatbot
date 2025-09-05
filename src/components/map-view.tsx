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

// Stolen from https://developers.google.com/maps/documentation/javascript/examples/style-array
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];


export function MapView({ facilities, onSelectFacility, selectedFacility }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  const isMobile = useIsMobile();
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    if (map && selectedFacility) {
      map.panTo(selectedFacility.position);
    }
  }, [selectedFacility, map]);

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 p-4">
        <div className="text-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12">
          <h3 className="font-headline text-2xl text-muted-foreground">Map Unavailable</h3>
          <p className="text-muted-foreground mt-2">
            The Google Maps API key is not configured.
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
        mapId={mapId}
        gestureHandling={isMobile ? 'cooperative' : 'greedy'}
        disableDefaultUI={true}
        styles={darkMapStyle}
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
