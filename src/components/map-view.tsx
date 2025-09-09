
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
  const routeControlRef = React.useRef<L.Routing.Control | null>(null);
  const layerControlRef = React.useRef<Control.Layers | null>(null);


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
            // CRUCIAL: Remove routing control BEFORE destroying the map.
            if (routeControlRef.current) {
                routeControlRef.current.remove(); // This safely removes the control from the map
                routeControlRef.current = null;
            }
            if(layerControlRef.current){
                map.removeControl(layerControlRef.current);
                layerControlRef.current = null;
            }

            // Remove layers and markers
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
    if (routeControlRef.current) {
        routeControlRef.current.remove();
        routeControlRef.current = null;
    }

    if (route) {
      const start = new LatLng(route.start.lat, route.start.lng);
      const destination = new LatLng(route.destination.lat, route.destination.lng);

      const control = L.Routing.control({
        waypoints: [start, destination],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        createMarker: (waypointIndex, waypoint) => {
          const isStart = waypointIndex === 0;

          if (isStart) {
            const isUserLocation =
              userPosition &&
              waypoint.latLng.lat === userPosition.lat &&
              waypoint.latLng.lng === userPosition.lng;
            if (isUserLocation) return null; 

            const startFacility = facilities.find(
              (f) =>
                f.position.lat === waypoint.latLng.lat &&
                f.position.lng === waypoint.latLng.lng
            );
            if (startFacility) {
              return new LeafletMarker(waypoint.latLng, {
                icon: createCustomIcon(startFacility, true),
                draggable: false,
                zIndexOffset: 1000,
              });
            }
          } else { 
            return new LeafletMarker(waypoint.latLng, {
              icon: createCustomIcon({ type: 'destination' }, true),
              draggable: false,
              zIndexOffset: 1000,
            });
          }

          return null; 
        },
      }).addTo(map);
      routeControlRef.current = control;
    }
  }, [route, userPosition, facilities]);
  
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
