
"use client";

import { ParkingCircle, Hotel, Hospital, Siren, Flame, Navigation, MapPin, Landmark, Search, Waves, Swords, Shield } from 'lucide-react';
import type { AnyFacility, Parking, EmergencyService } from '@/types';
import { cn } from '@/lib/utils';

interface MapMarkerProps {
  facility: AnyFacility | { type: 'user' } | { type: 'destination' };
  isSelected: boolean;
}

export const MapMarker = ({ facility, isSelected }: MapMarkerProps) => {
    if (facility.type === 'user') {
        return (
             <div className={cn(
                'relative flex items-center justify-center',
                isSelected && 'z-10'
            )}>
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md animate-pulse"></div>
            </div>
        );
    }

    const baseClasses = "relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300";
    const selectedClasses = "scale-110 z-10";
    const pinClasses = "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[90%] after:border-8 after:border-t-[12px] after:border-transparent";

    const getIcon = () => {
        if (facility.type === 'destination') {
            return <MapPin className="w-5 h-5" />;
        }
        switch (facility.type) {
            case 'parking':
                return <ParkingCircle className="w-5 h-5" />;
            case 'hotel':
                return <Hotel className="w-5 h-5" />;
            case 'emergency':
                switch ((facility as EmergencyService).serviceType) {
                    case 'hospital': return <Hospital className="w-5 h-5" />;
                    case 'police': return <Siren className="w-5 h-5" />;
                    case 'fire': return <Flame className="w-5 h-5" />;
                    case 'police_station': return <Shield className="w-5 h-5" />;
                }
            case 'temple':
                return <Landmark className="w-5 h-5" />;
            case 'lost_and_found':
                return <Search className="w-5 h-5" />;
            case 'ghat':
                return <Waves className="w-5 h-5" />;
            case 'akhada':
                return <Swords className="w-5 h-5" />;
        }
    };

    const getColorClasses = () => {
         if (facility.type === 'destination') {
            return 'bg-primary after:border-t-primary';
        }
        if (facility.type === 'parking') {
            const parkingFacility = facility as Parking;
            switch (parkingFacility.status) {
                case 'crowded': return 'bg-[hsl(var(--status-bad))] after:border-t-[hsl(var(--status-bad))]';
                case 'alternative': return 'bg-[hsl(var(--status-alt))] after:border-t-[hsl(var(--status-alt))]';
                case 'normal':
                default:
                    return 'bg-[hsl(var(--status-good))] after:border-t-[hsl(var(--status-good))]';
            }
        }
        if (facility.type === 'hotel') {
            return 'bg-accent after:border-t-accent';
        }
        if (facility.type === 'emergency') {
             if ((facility as EmergencyService).serviceType === 'police_station') {
                return 'bg-blue-600 after:border-t-blue-600';
            }
            return 'bg-destructive after:border-t-destructive';
        }
        if (facility.type === 'temple') {
            return 'bg-orange-500 after:border-t-orange-500';
        }
        if (facility.type === 'lost_and_found') {
            return 'bg-yellow-500 after:border-t-yellow-500';
        }
        if (facility.type === 'ghat') {
            return 'bg-cyan-500 after:border-t-cyan-500';
        }
        if (facility.type === 'akhada') {
            return 'bg-purple-500 after:border-t-purple-500';
        }
        return 'bg-primary after:border-t-primary';
    };

    return (
        <div className={cn(
            'relative flex flex-col items-center',
            isSelected && 'drop-shadow-2xl'
        )}>
            <div className={cn(baseClasses, getColorClasses(), pinClasses, isSelected && selectedClasses)}>
                {getIcon()}
            </div>
        </div>
    );
};
