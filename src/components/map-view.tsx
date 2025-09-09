
"use client";

import * as React from 'react';
import type { AnyFacility, Position, Route } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { divIcon, layerGroup, LayerGroup, Marker as LeafletMarker, LatLngExpression, Control } from 'leaflet';
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

const createCustomIcon = (facility: AnyFacility | { type: 'user' }, isSelected: boolean) => {
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
  const facilityMarkersRef = React.useRef<Record<string, L.Marker>>({});
  const userMarkerRef = React.useRef<L.Marker | null>(null);
  const routingControlRef = React.useRef<L.Routing.Control | null>(null);

  // Single, consolidated useEffect for all map logic
  React.useEffect(() => {
    // Initialize map only once
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: ujjainCenter,
        zoom: defaultZoom,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        ]
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // == USER POSITION MARKER ==
    if (userPosition) {
      const userIcon = createCustomIcon({ type: 'user' }, false);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
      } else {
        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
          icon: userIcon,
          zIndexOffset: 1000 // Keep user marker on top
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // == FACILITY MARKERS ==
    // Remove markers for facilities that are no longer in the list
    Object.keys(facilityMarkersRef.current).forEach(facilityId => {
      if (!facilities.some(f => f.id === facilityId)) {
        facilityMarkersRef.current[facilityId].remove();
        delete facilityMarkersRef.current[facilityId];
      }
    });

    // Add or update markers for current facilities
    facilities.forEach(facility => {
      const isSelected = selectedFacility?.id === facility.id;
      const icon = createCustomIcon(facility, isSelected);
      
      if (facilityMarkersRef.current[facility.id]) {
        // Update existing marker
        const marker = facilityMarkersRef.current[facility.id];
        marker.setIcon(icon);
        marker.setZIndexOffset(isSelected ? 200 : 0);
      } else {
        // Create new marker
        const marker = L.marker([facility.position.lat, facility.position.lng], {
          icon,
          zIndexOffset: isSelected ? 200 : 0
        });
        marker.on('click', () => onSelectFacility(facility));
        marker.addTo(map);
        facilityMarkersRef.current[facility.id] = marker;
      }
    });

    // == ROUTING ==
    // Remove existing route if the new route is null or different
    if (routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }

    // Add new route if it exists
    if (route) {
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(route.start.lat, route.start.lng),
                L.latLng(route.destination.lat, route.destination.lng)
            ],
            // Use our own markers, so hide the default ones.
            createMarker: () => null,
            lineOptions: {
                styles: [{ color: '#0ea5e9', opacity: 0.8, weight: 6 }],
                addWaypoints: false,
            },
            show: false, // Disable the default instruction container
        }).on('routingerror', (e) => {
            console.log('Could not find a route.');
        }).addTo(map);
        
        routingControlRef.current = routingControl;
    }

    // == MAP CENTERING ==
    if (route) {
      const waypoints = [
        L.latLng(route.start.lat, route.start.lng),
        L.latLng(route.destination.lat, route.destination.lng)
      ];
      map.fitBounds(L.latLngBounds(waypoints), {padding: [50, 50]});
    } else if (center) {
      map.setView([center.lat, center.lng], 15, {
        animate: true,
        pan: { duration: 0.5 }
      });
    }

    // == MASTER CLEANUP FUNCTION ==
    return () => {
      // This cleanup runs when dependencies change, or on unmount
      if (routingControlRef.current) {
          routingControlRef.current.remove();
          routingControlRef.current = null;
      }
    };
    // This effect re-runs whenever its dependencies change.
  }, [facilities, selectedFacility, userPosition, center, route, onSelectFacility]);

  // A separate effect just for unmounting the component and destroying the map.
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    return () => {
      if (map) {
          map.remove();
          mapInstanceRef.current = null;
          // Clear all refs
          facilityMarkersRef.current = {};
          userMarkerRef.current = null;
          routingControlRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs only on unmount.


  return <div ref={mapRef} className='w-full h-full' />;
}
