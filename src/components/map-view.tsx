"use client";

import * as React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import type { AnyFacility } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon, layerGroup, LayerGroup, Marker as LeafletMarker, LatLngExpression, Map } from 'leaflet';
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

const MapUpdater = ({ facilities, onSelectFacility, selectedFacility }: { facilities: AnyFacility[], onSelectFacility: (f: AnyFacility) => void, selectedFacility: AnyFacility | null }) => {
    const map = useMap();
    const markerLayerRef = React.useRef<LayerGroup | null>(null);

    React.useEffect(() => {
        if (!markerLayerRef.current) {
            markerLayerRef.current = layerGroup().addTo(map);
        }
        
        const layer = markerLayerRef.current;
        layer.clearLayers();
        
        facilities.forEach(facility => {
            const isSelected = selectedFacility?.id === facility.id;
            const newMarker = new LeafletMarker([facility.position.lat, facility.position.lng], {
                icon: createCustomIcon(facility, isSelected)
            });
            newMarker.on('click', () => onSelectFacility(facility));
            layer.addLayer(newMarker);
        });
    }, [facilities, selectedFacility, onSelectFacility, map]);
    
    React.useEffect(() => {
        if (selectedFacility) {
            map.setView([selectedFacility.position.lat, selectedFacility.position.lng], map.getZoom(), {
                animate: true,
                pan: {
                    duration: 0.5
                }
            });
        }
    }, [selectedFacility, map]);

    return null;
}

export default function MapView({ facilities, onSelectFacility, selectedFacility }: MapViewProps) {
  return (
    <MapContainer center={ujjainCenter} zoom={defaultZoom} scrollWheelZoom={true} className='w-full h-full'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater facilities={facilities} onSelectFacility={onSelectFacility} selectedFacility={selectedFacility} />
    </MapContainer>
  );
}
