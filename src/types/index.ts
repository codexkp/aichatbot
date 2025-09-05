export type Position = {
  lat: number;
  lng: number;
};

export type Facility = {
  id: string;
  name: string;
  position: Position;
  type: "parking" | "hotel" | "emergency";
};

export type Parking = Facility & {
  type: "parking";
  capacity: number;
  occupancy: number;
  status: "normal" | "crowded" | "alternative";
};

export type Hotel = Facility & {
  type: "hotel";
  amenities: string[];
  contact: string;
  distance: string;
};

export type EmergencyService = Facility & {
  type: "emergency";
  serviceType: "hospital" | "police" | "fire";
  contact: string;
};

export type AnyFacility = Parking | Hotel | EmergencyService;
