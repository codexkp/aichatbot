"use client";

import * as React from 'react';
import type { AnyFacility, Position, Route } from '@/types';
import { MapMarker } from './map-marker';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { divIcon, layerGroup, LayerGroup, Marker as LeafletMarker, LatLngExpression, LatLng } from 'leaflet';
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
    return divIcon({
      html: markerHtml,
      className: 'dummy',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
};

export default function MapView({ facilities, onSelectFacility, selectedFacility, userPosition, center, route }: MapViewProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markerLayerRef = React.useRef<LayerGroup | null>(null);
  const userMarkerRef = React.useRef<LeafletMarker | null>(null);
  const routeControlRef = React.useRef<L.Routing.Control | null>(null);

  React.useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(ujjainCenter, defaultZoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markerLayerRef.current = layerGroup().addTo(map);
    }
    
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  React.useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer || !mapInstanceRef.current) return;

    if (route) {
        layer.clearLayers();
        if (routeControlRef.current) {
            mapInstanceRef.current.removeControl(routeControlRef.current);
        }

        const start = new LatLng(route.start.lat, route.start.lng);
        const destination = new LatLng(route.destination.lat, route.destination.lng);

        routeControlRef.current = L.Routing.control({
            waypoints: [start, destination],
            routeWhileDragging: false,
            show: false,
            addWaypoints: false,
            createMarker: (waypointIndex, waypoint, numberOfWaypoints) => {
                const isStart = waypointIndex === 0;
                
                if (isStart) {
                    const isUserLocation = userPosition && waypoint.latLng.lat === userPosition.lat && waypoint.latLng.lng === userPosition.lng;
                    if (isUserLocation) {
                        return new LeafletMarker(waypoint.latLng, { icon: createCustomIcon({ type: 'user' }, true), draggable: false });
                    }
                    // It's a facility
                    const startFacility = facilities.find(f => f.position.lat === waypoint.latLng.lat && f.position.lng === waypoint.latLng.lng);
                    if(startFacility){
                        return new LeafletMarker(waypoint.latLng, { icon: createCustomIcon(startFacility, true), draggable: false });
                    }
                } else { // It's the destination
                    const endFacility = facilities.find(f => f.position.lat === waypoint.latLng.lat && f.position.lng === waypoint.latLng.lng);
                    if (endFacility) {
                        return new LeafletMarker(waypoint.latLng, { icon: createCustomIcon(endFacility, true), draggable: false });
                    }
                }
                
                // Fallback to a standard marker if no facility matches, which should not happen in normal flow.
                return new LeafletMarker(waypoint.latLng, {draggable: false});
            }
        }).addTo(mapInstanceRef.current);

    } else {
        if (routeControlRef.current) {
            mapInstanceRef.current.removeControl(routeControlRef.current);
            routeControlRef.current = null;
        }
        layer.clearLayers();
        facilities.forEach(facility => {
            const isSelected = selectedFacility?.id === facility.id;
            const newMarker = new LeafletMarker([facility.position.lat, facility.position.lng], {
                icon: createCustomIcon(facility, isSelected)
            });
            newMarker.on('click', () => onSelectFacility(facility));
            layer.addLayer(newMarker);
        });
    }
  }, [facilities, selectedFacility, onSelectFacility, route, userPosition]);
  
  React.useEffect(() => {
    if (mapInstanceRef.current && userPosition) {
      const userIcon = createCustomIcon({ type: 'user' }, false);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
        const marker = new LeafletMarker([userPosition.lat, userPosition.lng], {
          icon: userIcon,
          zIndexOffset: 1000
        });
        if(mapInstanceRef.current) {
            marker.addTo(mapInstanceRef.current);
            userMarkerRef.current = marker;
        }
      }
    }
  }, [userPosition]);
  
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

  React.useEffect(() => {
    if (mapInstanceRef.current && selectedFacility && !route) {
        const layer = markerLayerRef.current;
        if (!layer) return;
        layer.eachLayer(l => {
            const marker = l as LeafletMarker;
            const facility = facilities.find(f => 
                f.position.lat === marker.getLatLng().lat && 
                f.position.lng === marker.getLatLng().lng
            );
            if (facility) {
                const isSelected = selectedFacility?.id === facility.id;
                marker.setIcon(createCustomIcon(facility, isSelected));
            }
        });

        mapInstanceRef.current.setView([selectedFacility.position.lat, selectedFacility.position.lng], mapInstanceRef.current.getZoom(), {
            animate: true,
            pan: {
                duration: 0.5
            }
        });
    }
  }, [selectedFacility, facilities, route]);


  return <div ref={mapRef} className='w-full h-full' />;
}
