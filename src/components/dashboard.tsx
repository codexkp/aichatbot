
"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  initialFacilities,
} from "@/lib/data";
import type { AnyFacility, Parking, Position, Route } from "@/types";
import { Header } from "@/components/header";
import { Logo } from "@/components/logo";
import { FacilityCard } from "@/components/facility-card";
import { Button } from "./ui/button";
import { Loader2, Navigation, ParkingCircle, Hotel, Siren, Crosshair, Search, Waves, Swords, Building2, Landmark } from "lucide-react";
import { analyzeParkingCrowding } from "@/ai/flows/crowding-analysis-and-alert";
import { useToast } from "@/hooks/use-toast";
import { ChatbotDialog } from "@/components/smart-report-dialog";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
});

type FilterType = "all" | "parking" | "hotel" | "emergency" | "temple" | "lost_and_found" | "ghat" | "akhada" | "police_station";

export function Dashboard() {
  const [facilities, setFacilities] = React.useState<AnyFacility[]>(initialFacilities);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [selectedFacility, setSelectedFacility] = React.useState<AnyFacility | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const [userPosition, setUserPosition] = React.useState<Position | null>(null);
  const [mapCenter, setMapCenter] = React.useState<Position | null>(null);
  const [route, setRoute] = React.useState<Route | null>(null);
  const { toast } = useToast();

  const handleSelectFacility = React.useCallback((facility: AnyFacility) => {
    setSelectedFacility(facility);
    setRoute(null);
  }, []);

  const handleLocateFacility = React.useCallback((facilityId: string) => {
    const facility = initialFacilities.find(f => f.id === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      setMapCenter(facility.position);
      setIsChatbotOpen(false);
      
      // Update filter to show the located facility's type
      if (facility.type === 'emergency' && facility.serviceType === 'police_station') {
        setActiveFilter('police_station');
      } else {
        setActiveFilter(facility.type);
      }
    }
  }, []);
  
  const handleShowDirections = React.useCallback((route: Route) => {
    setRoute(route);
    setSelectedFacility(null);
  }, []);


  const filteredFacilities = React.useMemo(() => {
    if (activeFilter === "all") {
      return facilities;
    }
     if (activeFilter === "police_station") {
      return facilities.filter((f) => f.type === 'emergency' && f.serviceType === 'police_station');
    }
    return facilities.filter((f) => f.type === activeFilter);
  }, [activeFilter, facilities]);
  
  const handleLocateMe = React.useCallback(() => {
    if (userPosition) {
      setMapCenter(userPosition);
    }
  }, [userPosition]);


  React.useEffect(() => {
    setSelectedFacility(null);
    setRoute(null);
  }, [activeFilter]);
  
  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(pos);
        setMapCenter(pos);
      },
      () => {
        toast({
          title: 'Location Access Denied',
          description: "We couldn't access your location. Some features may be unavailable.",
          variant: 'destructive',
        });
      }
    );
  }, [toast]);

  const handleAnalyzeCrowding = async () => {
    setIsAnalyzing(true);
    try {
      const parkingDataString = facilities
        .filter((f): f is Parking => f.type === "parking")
        .map((p) => `Lot: ${p.name}, Occupancy: ${p.occupancy}/${p.capacity}`)
        .join("; ");
      
      const result = await analyzeParkingCrowding({ parkingData: parkingDataString });

      if (result.isCrowded) {
        toast({
            title: "High Traffic Alert",
            description: "Unusual crowding detected. Recommending alternative parking.",
        });
        const suggestedNames = result.suggestedAlternatives.split(',').map(s => s.trim());
        
        setFacilities(prev => prev.map(f => {
            if (f.type !== 'parking') return f;
            
            const isSuggested = suggestedNames.includes(f.name);
            if (isSuggested) return { ...f, status: 'alternative' };

            if (f.occupancy / f.capacity > 0.8) return { ...f, status: 'crowded' };
            
            return { ...f, status: 'normal' };
        }));

      } else {
        toast({
            title: "Parking Status Normal",
            description: "Parking availability is normal.",
        });
        setFacilities(prev => prev.map(f => {
            if (f.type !== 'parking') return f;
            return { ...f, status: 'normal' };
        }));
      }

    } catch (error) {
        console.error("Error analyzing parking crowding:", error);
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "Could not analyze parking data at this time.",
        });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Facilities</SidebarGroupLabel>
            <SidebarMenu>
              <FilterButton filter="all" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Navigation}>
                All Facilities
              </FilterButton>
              <FilterButton filter="parking" activeFilter={activeFilter} setFilter={setActiveFilter} icon={ParkingCircle}>
                Parking
              </FilterButton>
              <FilterButton filter="hotel" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Hotel}>
                Hotels
              </FilterButton>
              <FilterButton filter="emergency" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Siren}>
                Emergency
              </FilterButton>
               <FilterButton filter="police_station" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Building2}>
                Police Stations
              </FilterButton>
              <FilterButton filter="temple" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Landmark}>
                Temples
              </FilterButton>
              <FilterButton filter="lost_and_found" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Search}>
                Lost & Found
              </FilterButton>
              <FilterButton filter="ghat" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Waves}>
                Ghats
              </FilterButton>
              <FilterButton filter="akhada" activeFilter={activeFilter} setFilter={setActiveFilter} icon={Swords}>
                Akhadas
              </FilterButton>
            </SidebarMenu>
          </SidebarGroup>

          {activeFilter === 'parking' || activeFilter === 'all' ? (
             <SidebarGroup>
                <SidebarGroupLabel>Parking Analysis</SidebarGroupLabel>
                <div className="px-2">
                    <Button onClick={handleAnalyzeCrowding} disabled={isAnalyzing} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Analyze Crowding
                    </Button>
                </div>
            </SidebarGroup>
          ) : null}

          <SidebarGroup>
             <SidebarGroupLabel>Details</SidebarGroupLabel>
                <div className="px-2">
                    {selectedFacility ? (
                        <FacilityCard facility={selectedFacility} />
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4 border-dashed border rounded-lg">
                            <p>Select a facility on the map to see details.</p>
                        </div>
                    )}
                </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-primary">Use chatbot to access the facilities</span>
            <ChatbotDialog 
                open={isChatbotOpen} 
                onOpenChange={setIsChatbotOpen} 
                userPosition={userPosition}
                onLocateFacility={handleLocateFacility}
                onShowDirections={handleShowDirections}
            />
          </div>
        </Header>
        <div className="flex-1 relative">
           <div className="w-full h-full">
            <MapView
                facilities={filteredFacilities}
                onSelectFacility={handleSelectFacility}
                selectedFacility={selectedFacility}
                userPosition={userPosition}
                center={mapCenter}
                route={route}
            />
             <div className="absolute bottom-4 right-4 z-[500]">
                <Button size="icon" onClick={handleLocateMe} disabled={!userPosition} className="rounded-full shadow-lg">
                    <Crosshair className="h-5 w-5" />
                    <span className="sr-only">Locate Me</span>
                </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function FilterButton({ filter, activeFilter, setFilter, icon: Icon, children }: { filter: FilterType, activeFilter: FilterType, setFilter: (f: FilterType) => void, icon: React.ElementType, children: React.ReactNode}) {
    const { state } = useSidebar();
    const isActive = activeFilter === filter;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isActive}
              onClick={() => setFilter(filter)}
              tooltip={state === 'collapsed' ? String(children) : undefined}
              className={cn(isActive && "bg-primary/10 text-primary font-semibold")}
            >
              <Icon/>
              <span>{children}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
