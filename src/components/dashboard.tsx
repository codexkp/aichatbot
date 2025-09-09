
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
import { useToast } from "@/hooks/use-toast";
import { ChatbotDialog } from "@/components/smart-report-dialog";
import { cn } from "@/lib/utils";
import { analyzeParkingCrowding } from "@/ai/flows/crowding-analysis-and-alert";

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
});

type FilterType = "all" | "parking" | "hotel" | "emergency" | "temple" | "lost_and_found" | "ghat" | "akhada" | "police_station";

export function Dashboard() {
  const [facilities, setFacilities] = React.useState<AnyFacility[]>(initialFacilities);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [selectedFacility, setSelectedFacility] = React.useState<AnyFacility | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);
  const [userPosition, setUserPosition] = React.useState<Position | null>(null);
  const [mapCenter, setMapCenter] = React.useState<Position | null>(null);
  const [route, setRoute] = React.useState<Route | null>(null);
  const { toast } = useToast();
  const notifiedCrowdedLots = React.useRef<Set<string>>(new Set());

  const handleSelectFacility = React.useCallback((facility: AnyFacility) => {
    setSelectedFacility(facility);
    setRoute(null);
    setActiveFilter("all");
    setMapCenter(facility.position);
  }, []);

  const handleLocateFacility = React.useCallback((facilityId: string) => {
    const facility = initialFacilities.find(f => f.id === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      setMapCenter(facility.position);
      setIsChatbotOpen(false);
      setActiveFilter("all");
    }
  }, []);
  
  const handleShowDirections = React.useCallback((route: Route) => {
    setRoute(route);
    setSelectedFacility(null);
    setActiveFilter("all"); 
    setIsChatbotOpen(false);
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
      setActiveFilter("all");
    }
  }, [userPosition]);


  React.useEffect(() => {
    if (activeFilter !== "all") {
      setSelectedFacility(null);
      setRoute(null);
    }
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
      },
      { enableHighAccuracy: true }
    );
  }, [toast]);

  // Real-time data simulation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFacilities(prevFacilities => {
        const updatedFacilities = prevFacilities.map(f => {
          if (f.type === 'parking') {
            const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
            let newOccupancy = f.occupancy + change;
            if (newOccupancy < 0) newOccupancy = 0;
            if (newOccupancy > f.capacity) newOccupancy = f.capacity;
            
            const occupancyRate = newOccupancy / f.capacity;
            let newStatus: Parking['status'] = 'normal';
            if (occupancyRate > 0.95) {
                newStatus = 'crowded';
            }
            
            return { ...f, occupancy: newOccupancy, status: newStatus };
          }
          return f;
        });

        // Update selected facility details if it's a parking facility
        if (selectedFacility && selectedFacility.type === 'parking') {
          const updatedSelected = updatedFacilities.find(f => f.id === selectedFacility.id);
          if (updatedSelected) {
            setSelectedFacility(updatedSelected);
          }
        }
        
        return updatedFacilities;
      });
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [selectedFacility]);

  // Crowding analysis
  React.useEffect(() => {
    const checkCrowding = async (parkingData: string, newlyCrowdedIds: string[]) => {
      try {
        const result = await analyzeParkingCrowding({parkingData});

        if (result.isCrowded) {
          toast({
            title: 'Parking Alert',
            description: `Crowding detected. Suggested alternatives: ${result.suggestedAlternatives}`,
            variant: 'destructive',
            duration: 9000,
          });
          
          newlyCrowdedIds.forEach(id => notifiedCrowdedLots.current.add(id));

          // Update status for suggested alternatives
          setFacilities((prevFacilities) => {
            const alternatives = result.suggestedAlternatives
              .split(',')
              .map((s) => s.trim());
            return prevFacilities.map((f) => {
              if (f.type === 'parking' && alternatives.includes(f.name)) {
                return {...f, status: 'alternative' as Parking['status']};
              }
              return f;
            });
          });
        }
      } catch (error) {
        console.error('Crowding analysis failed:', error);
      }
    };

    const allParkingLots = facilities.filter(f => f.type === 'parking') as Parking[];
    
    const newlyCrowdedLots = allParkingLots.filter(
      (f) => f.status === 'crowded' && !notifiedCrowdedLots.current.has(f.id)
    );

    if (newlyCrowdedLots.length > 0) {
      const parkingData = allParkingLots
        .map((park) => `${park.name}: ${park.occupancy}/${park.capacity} (${park.status})`)
        .join('\n');
      
      const newlyCrowdedIds = newlyCrowdedLots.map(f => f.id);
      checkCrowding(parkingData, newlyCrowdedIds);
    }
    
    // Clean up notified lots that are no longer crowded
    const currentlyCrowdedIds = new Set(allParkingLots.filter(f => f.status === 'crowded').map(f => f.id));
    notifiedCrowdedLots.current.forEach(id => {
        if (!currentlyCrowdedIds.has(id)) {
            notifiedCrowdedLots.current.delete(id);
        }
    });

  }, [facilities, toast]);


  const showMap = activeFilter === 'all';

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

          <SidebarGroup>
             <SidebarGroupLabel>Details</SidebarGroupLabel>
                <div className="px-2">
                    {selectedFacility ? (
                        <FacilityCard facility={selectedFacility} />
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4 border-dashed border rounded-lg">
                           {activeFilter === 'all' ? (
                             <p>Select a facility on the map to see details.</p>
                           ) : (
                              <p>Select a facility from the list to see details.</p>
                           )}
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
           {showMap && !isChatbotOpen ? (
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
           ) : (
            <div className="w-full h-full bg-muted p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities.map(facility => (
                  <button key={facility.id} onClick={() => setSelectedFacility(facility)} className="w-full text-left">
                     <FacilityCard facility={facility} />
                  </button>
                ))}
              </div>
            </div>
           )}
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

    