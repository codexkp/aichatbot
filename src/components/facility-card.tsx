
"use client";

import type { AnyFacility, Hotel, Parking, EmergencyService, Temple, LostAndFound, Ghat, Akhada } from "@/types";
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
  Landmark,
  Search,
  Waves,
  Swords,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FacilityCard({ facility, className }: { facility: AnyFacility, className?: string }) {
  const renderIcon = () => {
    switch (facility.type) {
      case "parking":
        return <ParkingCircle className="h-5 w-5 text-muted-foreground" />;
      case "hotel":
        return <HotelIcon className="h-5 w-5 text-muted-foreground" />;
      case "emergency":
        switch (facility.serviceType) {
          case "hospital": return <Hospital className="h-5 w-5 text-muted-foreground" />;
          case "police": return <Siren className="h-5 w-5 text-muted-foreground" />;
          case "fire": return <Flame className="h-5 w-5 text-muted-foreground" />;
          case "police_station": return <Shield className="h-5 w-5 text-muted-foreground" />;
        }
      case "temple":
        return <Landmark className="h-5 w-5 text-muted-foreground" />;
      case "lost_and_found":
        return <Search className="h-5 w-5 text-muted-foreground" />;
      case "ghat":
        return <Waves className="h-5 w-5 text-muted-foreground" />;
      case "akhada":
        return <Swords className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full shadow-lg border-accent/20 hover:border-accent/60 transition-colors", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{renderIcon()}</div>
          <div className="flex-grow">
            <CardTitle className="font-headline text-lg">{facility.name}</CardTitle>
            <CardDescription className="capitalize">{facility.type.replace(/_/g, " ")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Separator />
        {facility.type === "parking" && <ParkingDetails facility={facility} />}
        {facility.type === "hotel" && <HotelDetails facility={facility} />}
        {facility.type === "emergency" && <EmergencyDetails facility={facility} />}
        {facility.type === "temple" && <TempleDetails facility={facility} />}
        {facility.type === "lost_and_found" && <LostAndFoundDetails facility={facility} />}
        {facility.type === "ghat" && <GhatDetails facility={facility} />}
        {facility.type === "akhada" && <AkhadaDetails facility={facility} />}
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
          {facility.serviceType.replace(/_/g, " ")}
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

function TempleDetails({ facility }: { facility: Temple }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="font-medium">Main Deity:</span>
                <span>{facility.deity}</span>
            </div>
        </div>
    );
}

function LostAndFoundDetails({ facility }: { facility: LostAndFound }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Contact:</span>
                <a href={`tel:${facility.contact}`} className="hover:underline">
                    {facility.contact}
                </a>
            </div>
        </div>
    );
}

function GhatDetails({ facility }: { facility: Ghat }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">River:</span>
                <span>{facility.river}</span>
            </div>
        </div>
    );
}

function AkhadaDetails({ facility }: { facility: Akhada }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="font-medium">Sect:</span>
                <span>{facility.sect}</span>
            </div>
        </div>
    );
}
