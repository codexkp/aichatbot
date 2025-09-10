"use client";

import * as React from 'react';
import type { AnyFacility, Position, Route } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { divIcon, LatLngExpression } from 'leaflet';
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

export default function MapView({
  facilities,
  onSelectFacility,
  selectedFacility,
  userPosition,
  center,
  route,
}: MapViewProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const facilityMarkersRef = React.useRef<Record<string, L.Marker>>({});
  const userMarkerRef = React.useRef<L.Marker | null>(null);
  const routingControlRef = React.useRef<L.Routing.Control | null>(null);

  // Main map effect
  React.useEffect(() => {
    // Initialize map once
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: ujjainCenter,
        zoom: defaultZoom,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
        ],
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // == USER MARKER ==
    if (userPosition) {
      const userIcon = createCustomIcon({ type: 'user' }, false);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
      } else {
        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    // == FACILITY MARKERS ==
    const currentMarkerIds = new Set(facilities.map(f => f.id));
    Object.keys(facilityMarkersRef.current).forEach((facilityId) => {
      if (!currentMarkerIds.has(facilityId)) {
        map.removeLayer(facilityMarkersRef.current[facilityId]);
        delete facilityMarkersRef.current[facilityId];
      }
    });

    facilities.forEach((facility) => {
      const isSelected = selectedFacility?.id === facility.id;
      const icon = createCustomIcon(facility, isSelected);

      if (facilityMarkersRef.current[facility.id]) {
        const marker = facilityMarkersRef.current[facility.id];
        marker.setIcon(icon);
        marker.setZIndexOffset(isSelected ? 200 : 0);
      } else {
        const marker = L.marker([facility.position.lat, facility.position.lng], {
          icon,
          zIndexOffset: isSelected ? 200 : 0,
        });
        marker.on('click', () => onSelectFacility(facility));
        marker.addTo(map);
        facilityMarkersRef.current[facility.id] = marker;
      }
    });

    // == ROUTING ==
    if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
    }

    if (route) {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(route.start.lat, route.start.lng),
          L.latLng(route.destination.lat, route.destination.lng),
        ],
        createMarker: () => null, // disable default markers
        lineOptions: {
          styles: [{ color: '#0ea5e9', opacity: 0.8, weight: 6 }],
          addWaypoints: false,
        },
        show: false,
      })
        .on('routingerror', () => {
          console.log('Could not find a route.');
        })
        .addTo(map);

      routingControlRef.current = routingControl;
    }

    // == CENTERING ==
    if (route) {
      const waypoints = [
        L.latLng(route.start.lat, route.start.lng),
        L.latLng(route.destination.lat, route.destination.lng),
      ];
      map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50] });
    } else if (center) {
      map.setView([center.lat, center.lng], 15, {
        animate: true,
        pan: { duration: 0.5 },
      });
    }

  }, [facilities, selectedFacility, userPosition, center, route, onSelectFacility]);

  // Destroy map on unmount
  React.useEffect(() => {
    // This function is called when the component is about to unmount.
    return () => {
      const map = mapInstanceRef.current;
      if (map) {
        // First, remove the routing control if it exists.
        if (routingControlRef.current) {
          routingControlRef.current.remove();
          routingControlRef.current = null;
        }

        // Then, remove the map itself.
        map.remove();
        mapInstanceRef.current = null;
        
        // Clear out refs
        facilityMarkersRef.current = {};
        userMarkerRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on unmount.

  return <div ref={mapRef} className="w-full h-full" />;
}