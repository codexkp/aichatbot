
export type Position = {
  lat: number;
  lng: number;
};

export type Facility = {
  id: string;
  name: string;
  position: Position;
  type: "parking" | "hotel" | "emergency" | "temple" | "lost_and_found" | "ghat" | "akhada";
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
  serviceType: "hospital" | "police" | "fire" | "police_station";
  contact: string;
};

export type Temple = Facility & {
  type: "temple";
  deity: string;
};

export type LostAndFound = Facility & {
  type: "lost_and_found";
  contact: string;
};

export type Ghat = Facility & {
  type: "ghat";
  river: string;
};

export type Akhada = Facility & {
  type: "akhada";
  sect: string;
};


export type AnyFacility = Parking | Hotel | EmergencyService | Temple | LostAndFound | Ghat | Akhada;

export type Route = {
    start: Position;
    destination: Position;
};
