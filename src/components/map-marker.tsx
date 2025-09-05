"use client";

import { ParkingCircle, Hotel, Hospital, Siren, Flame, User } from 'lucide-react';
import type { AnyFacility, Parking } from '@/types';
import { cn } from '@/lib/utils';

interface MapMarkerProps {
  facility: AnyFacility | { type: 'user' };
  isSelected: boolean;
}

export const MapMarker = ({ facility, isSelected }: MapMarkerProps) => {
  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg transform transition-all duration-300";
  const selectedClasses = "scale-125 ring-4 ring-offset-2 ring-offset-background";

  const getIcon = () => {
    if (facility.type === 'user') {
      return <User className="w-6 h-6" />;
    }
    switch (facility.type) {
      case 'parking':
        return <ParkingCircle className="w-6 h-6" />;
      case 'hotel':
        return <Hotel className="w-6 h-6" />;
      case 'emergency':
        switch (facility.serviceType) {
          case 'hospital':
            return <Hospital className="w-6 h-6" />;
          case 'police':
            return <Siren className="w-6 h-6" />;
          case 'fire':
            return <Flame className="w-6 h-6" />;
        }
    }
  };

  const getBackgroundColor = () => {
    if (facility.type === 'user') {
        return 'bg-blue-500';
    }
    if (facility.type === 'parking') {
      const parkingFacility = facility as Parking;
      switch (parkingFacility.status) {
        case 'crowded': return 'bg-[hsl(var(--status-bad))]';
        case 'alternative': return 'bg-[hsl(var(--status-alt))]';
        case 'normal': 
        default:
          return 'bg-[hsl(var(--status-good))]';
      }
    }
    if (facility.type === 'hotel') {
        return 'bg-accent';
    }
    if (facility.type === 'emergency') {
        return 'bg-destructive';
    }
    return 'bg-primary';
  };

  return (
    <div className={cn(baseClasses, getBackgroundColor(), isSelected && cn(selectedClasses, 'ring-primary'))}>
      {getIcon()}
    </div>
  );
};
