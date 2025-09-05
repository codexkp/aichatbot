"use client";

import * as React from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import type { AnyFacility } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon, Map as LeafletMap, layerGroup, LayerGroup, Marker as LeafletMarker, LatLngExpression, icon } from 'leaflet';
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

const MapUpdater = ({ facilities, onSelectFacility, selectedFacility, markerLayer }: { facilities: AnyFacility[], onSelectFacility: (f: AnyFacility) => void, selectedFacility: AnyFacility | null, markerLayer: LayerGroup | null }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!markerLayer) return;
        markerLayer.clearLayers();
        facilities.forEach(facility => {
            const isSelected = selectedFacility?.id === facility.id;
            const newMarker = new LeafletMarker([facility.position.lat, facility.position.lng], {
                icon: createCustomIcon(facility, isSelected)
            });
            newMarker.on('click', () => onSelectFacility(facility));
            markerLayer.addLayer(newMarker);
        });
    }, [facilities, selectedFacility, onSelectFacility, markerLayer]);
    
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
    const [map, setMap] = React.useState<LeafletMap | null>(null);
    const [markerLayer, setMarkerLayer] = React.useState<LayerGroup | null>(null);

    React.useEffect(() => {
        if (map) {
            const layer = layerGroup().addTo(map);
            setMarkerLayer(layer);
        }
    }, [map]);

  return (
    <MapContainer ref={setMap} center={ujjainCenter} zoom={defaultZoom} scrollWheelZoom={true} className='w-full h-full'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater facilities={facilities} onSelectFacility={onSelectFacility} selectedFacility={selectedFacility} markerLayer={markerLayer} />
    </MapContainer>
  );
}
