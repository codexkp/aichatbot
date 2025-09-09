
"use client";

import * as React from 'react';
import type { AnyFacility, Position, Route } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { divIcon, layerGroup, LayerGroup, Marker as LeafletMarker, LatLngExpression, LatLng, Control } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';


interface MapViewProps {
  facilities: AnyFacility[];
  onSelectFacility: (facility: AnyFacility) => void;
  selectedFacility: AnyFacility | null;
  userPosition: Position | null;
  center: Position | null;
  route: Route | null;
}

const ujjainCenter: LatLngExpression = [23.1793, 75.7849];
const defaultZoom = 13;

const createCustomIcon = (facility: AnyFacility | { type: 'user' } | { type: 'destination' }, isSelected: boolean) => {
    const markerHtml = renderToStaticMarkup(
      <MapMarker facility={facility} isSelected={isSelected} />
    );
    const iconSize: [number, number] = facility.type === 'user' ? [24, 24] : [40, 40];
    const iconAnchor: [number, number] = facility.type === 'user' ? [12, 12] : [20, 40];

    return divIcon({
      html: markerHtml,
      className: 'dummy',
      iconSize: iconSize,
      iconAnchor: iconAnchor,
    });
};

export default function MapView({ facilities, onSelectFacility, selectedFacility, userPosition, center, route }: MapViewProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markerLayerRef = React.useRef<LayerGroup | null>(null);
  const userMarkerRef = React.useRef<LeafletMarker | null>(null);
  const routingControlRef = React.useRef<Control.Routing | null>(null);


  // Initialize map and handle its destruction
  React.useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      
      const map = L.map(mapRef.current, {
        layers: [streetLayer] // Default layer
      }).setView(ujjainCenter, defaultZoom);
      mapInstanceRef.current = map;
      
      markerLayerRef.current = layerGroup().addTo(map);
    }

    // Main cleanup function
    return () => {
        const map = mapInstanceRef.current;
        if (map) {
            // Remove routing control FIRST
            if (routingControlRef.current) {
                routingControlRef.current.remove();
                routingControlRef.current = null;
            }
            // Then remove other layers and markers
            if (markerLayerRef.current) {
                markerLayerRef.current.clearLayers();
            }
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
                userMarkerRef.current = null;
            }

            // Finally, remove the map
            map.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);
  
  // Effect for user position marker
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userPosition) {
      const userIcon = createCustomIcon({ type: 'user' }, false);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
        userMarkerRef.current = new LeafletMarker([userPosition.lat, userPosition.lng], {
          icon: userIcon,
          zIndexOffset: 1000 // Ensure it's on top
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
        if (map.hasLayer(userMarkerRef.current)) {
            userMarkerRef.current.remove();
        }
        userMarkerRef.current = null;
    }
  }, [userPosition]);


  // Effect to draw facility markers
  React.useEffect(() => {
      const layer = markerLayerRef.current;
      if (!layer || !mapInstanceRef.current) return;

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

  // Effect to draw or clear the route
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous route if it exists
    if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
    }

    if (route) {
        const waypoints = [
            L.latLng(route.start.lat, route.start.lng),
            L.latLng(route.destination.lat, route.destination.lng)
        ];

        const routingControl = L.Routing.control({
            waypoints,
            // We use our own markers, so we make the default ones invisible.
            createMarker: () => null,
            lineOptions: {
                styles: [{ color: '#0ea5e9', opacity: 0.8, weight: 6 }],
                addWaypoints: false,
            },
            // Disable the default instruction container
            show: false,
        }).addTo(map);
        
        routingControlRef.current = routingControl;

        map.fitBounds(L.latLngBounds(waypoints), {padding: [50, 50]});
    }
  }, [route]);
  
  // Effect for centering the map
  React.useEffect(() => {
    if (mapInstanceRef.current && center) {
        mapInstanceRef.current.setView([center.lat, center.lng], 15, {
            animate: true,
            pan: {
                duration: 0.5
            }
        });
    }
  }, [center]);

  // Effect to update selected marker styling
  React.useEffect(() => {
    if (markerLayerRef.current) {
        markerLayerRef.current.eachLayer(l => {
            const marker = l as LeafletMarker;
            const facility = facilities.find(f => 
                f.position.lat === marker.getLatLng().lat && 
                f.position.lng === marker.getLatLng().lng
            );
            
            if (facility) {
                const isSelected = selectedFacility?.id === facility.id;
                marker.setIcon(createCustomIcon(facility, isSelected));
                if (isSelected) {
                   marker.setZIndexOffset(100);
                } else {
                   marker.setZIndexOffset(0);
                }
            }
        });
    }
  }, [selectedFacility, facilities]);


  return <div ref={mapRef} className='w-full h-full' />;
}
