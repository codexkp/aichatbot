"use client";

import type { AnyFacility, Hotel, Parking, EmergencyService } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ParkingCircle,
  Hotel as HotelIcon,
  Siren,
  Hospital,
  Flame,
  Phone,
  MapPin,
} from "lucide-react";

export function FacilityCard({ facility }: { facility: AnyFacility }) {
  const renderIcon = () => {
    switch (facility.type) {
      case "parking":
        return <ParkingCircle className="h-5 w-5 text-muted-foreground" />;
      case "hotel":
        return <HotelIcon className="h-5 w-5 text-muted-foreground" />;
      case "emergency":
        return facility.serviceType === "hospital" ? (
          <Hospital className="h-5 w-5 text-muted-foreground" />
        ) : facility.serviceType === "police" ? (
          <Siren className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Flame className="h-5 w-5 text-muted-foreground" />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-lg border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{renderIcon()}</div>
          <div className="flex-grow">
            <CardTitle className="font-headline text-lg">{facility.name}</CardTitle>
            <CardDescription className="capitalize">{facility.type}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Separator />
        {facility.type === "parking" && <ParkingDetails facility={facility} />}
        {facility.type === "hotel" && <HotelDetails facility={facility} />}
        {facility.type === "emergency" && <EmergencyDetails facility={facility} />}
      </CardContent>
    </Card>
  );
}

function ParkingDetails({ facility }: { facility: Parking }) {
  const occupancyRate = (facility.occupancy / facility.capacity) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Occupancy</span>
        <span className="font-medium">
          {facility.occupancy} / {facility.capacity}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${occupancyRate}%` }}
        ></div>
      </div>
    </div>
  );
}

function HotelDetails({ facility }: { facility: Hotel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{facility.distance} from main event</span>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <a href={`tel:${facility.contact}`} className="hover:underline">
          {facility.contact}
        </a>
      </div>
      <div>
        <h4 className="font-medium mb-2">Amenities</h4>
        <div className="flex flex-wrap gap-2">
          {facility.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="font-normal">
              {amenity}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmergencyDetails({ facility }: { facility: EmergencyService }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize border-accent">
          {facility.serviceType}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <a href={`tel:${facility.contact}`} className="hover:underline">
          {facility.contact}
        </a>
      </div>
    </div>
  );
}
