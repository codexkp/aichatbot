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
  parkingFacilities as initialParking,
} from "@/lib/data";
import type { AnyFacility, Parking } from "@/types";
import { Header } from "@/components/header";
import { Logo } from "@/components/logo";
import { FacilityCard } from "@/components/facility-card";
import { Button } from "./ui/button";
import { Loader2, Navigation, ParkingCircle, Hotel, Siren } from "lucide-react";
import { analyzeParkingCrowding } from "@/ai/flows/crowding-analysis-and-alert";
import { useToast } from "@/hooks/use-toast";

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
});


type FilterType = "all" | "parking" | "hotel" | "emergency";

export function Dashboard() {
  const [facilities, setFacilities] = React.useState<AnyFacility[]>(initialFacilities);
  const [filteredFacilities, setFilteredFacilities] = React.useState<AnyFacility[]>(initialFacilities);
  const [selectedFacility, setSelectedFacility] = React.useState<AnyFacility | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    let newFilteredFacilities = facilities;
    if (activeFilter !== "all") {
      newFilteredFacilities = facilities.filter((f) => f.type === activeFilter);
    }
    setFilteredFacilities(newFilteredFacilities);
    setSelectedFacility(null);
  }, [activeFilter, facilities]);

  const handleSelectFacility = (facility: AnyFacility) => {
    setSelectedFacility(facility);
  };

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

            // Mark lots with high occupancy as crowded, unless they are the alternative
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
        <Header />
        <div className="flex-1 relative">
            <MapView
                facilities={filteredFacilities}
                onSelectFacility={handleSelectFacility}
                selectedFacility={selectedFacility}
            />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function FilterButton({ filter, activeFilter, setFilter, icon: Icon, children }: { filter: FilterType, activeFilter: FilterType, setFilter: (f: FilterType) => void, icon: React.ElementType, children: React.ReactNode}) {
    const { state } = useSidebar();
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeFilter === filter}
              onClick={() => setFilter(filter)}
              tooltip={state === 'collapsed' ? String(children) : undefined}
            >
              <Icon/>
              <span>{children}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
