"use client";

import * as React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import type { AnyFacility } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

interface MapViewProps {
  facilities: AnyFacility[];
  onSelectFacility: (facility: AnyFacility) => void;
  selectedFacility: AnyFacility | null;
}

const ujjainCenter: [number, number] = [23.1793, 75.7849];

const RecenterAutomatically = ({lat,lng}: {lat: number, lng: number}) => {
    const map = useMap();
     React.useEffect(() => {
       map.setView([lat, lng]);
     }, [lat, lng, map]);
     return null;
}

function _MapView({ facilities, onSelectFacility, selectedFacility }: MapViewProps) {
  
  const createCustomIcon = (facility: AnyFacility, isSelected: boolean) => {
    const markerHtml = renderToStaticMarkup(
      <MapMarker facility={facility} isSelected={isSelected} />
    );
    return divIcon({
      html: markerHtml,
      className: 'dummy',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  return (
    <MapContainer center={ujjainCenter} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.position.lat, facility.position.lng]}
          icon={createCustomIcon(facility, selectedFacility?.id === facility.id)}
          eventHandlers={{
            click: () => {
              onSelectFacility(facility);
            },
          }}
        />
      ))}
      {selectedFacility && <RecenterAutomatically lat={selectedFacility.position.lat} lng={selectedFacility.position.lng} />}
    </MapContainer>
  );
}

export const MapView = React.memo(_MapView);
