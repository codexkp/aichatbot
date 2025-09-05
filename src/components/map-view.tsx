"use client";

import * as React from 'react';
import type { AnyFacility } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { divIcon, layerGroup, LayerGroup, Marker as LeafletMarker, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  facilities: AnyFacility[];
  onSelectFacility: (facility: AnyFacility) => void;
  selectedFacility: AnyFacility | null;
}

const ujjainCenter: LatLngExpression = [23.1793, 75.7849];
const defaultZoom = 13;

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

export default function MapView({ facilities, onSelectFacility, selectedFacility }: MapViewProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markerLayerRef = React.useRef<LayerGroup | null>(null);

  React.useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(ujjainCenter, defaultZoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markerLayerRef.current = layerGroup().addTo(map);
    }
    
    // Cleanup function to destroy the map instance
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []); // Empty dependency array ensures this runs only once on mount and unmount

  React.useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    
    facilities.forEach(facility => {
        const isSelected = selectedFacility?.id === facility.id;
        const newMarker = new LeafletMarker([facility.position.lat, facility.position.lng], {
            icon: createCustomIcon(facility, isSelected)
        });
        newMarker.on('click', () => onSelectFacility(facility));
        layer.addLayer(newMarker);
    });
  }, [facilities, selectedFacility, onSelectFacility]);
  
  React.useEffect(() => {
    if (mapInstanceRef.current && selectedFacility) {
        mapInstanceRef.current.setView([selectedFacility.position.lat, selectedFacility.position.lng], mapInstanceRef.current.getZoom(), {
            animate: true,
            pan: {
                duration: 0.5
            }
        });
    }
  }, [selectedFacility]);

  return <div ref={mapRef} className='w-full h-full' />;
}
