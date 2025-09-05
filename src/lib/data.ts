import type { Parking, Hotel, EmergencyService, AnyFacility } from "@/types";

export const parkingFacilities: Parking[] = [
  {
    id: "park_1",
    name: "Ramghat Parking",
    type: "parking",
    position: { lat: 23.1843, lng: 75.7668 },
    capacity: 500,
    occupancy: 450,
    status: 'normal',
  },
  {
    id: "park_2",
    name: "Mahakal Temple Parking",
    type: "parking",
    position: { lat: 23.1815, lng: 75.7681 },
    capacity: 800,
    occupancy: 780,
    status: 'normal',
  },
  {
    id: "park_3",
    name: "Nanakheda Bus Stand Parking",
    type: "parking",
    position: { lat: 23.1728, lng: 75.7954 },
    capacity: 1200,
    occupancy: 600,
    status: 'normal',
  },
    {
    id: "park_4",
    name: "Triveni Mela Ground",
    type: "parking",
    position: { lat: 23.1611, lng: 75.7633 },
    capacity: 2000,
    occupancy: 1500,
    status: 'normal',
  },
];

export const hotelFacilities: Hotel[] = [
  {
    id: "hotel_1",
    name: "Anjushree Hotel",
    type: "hotel",
    position: { lat: 23.1765, lng: 75.7885 },
    amenities: ["Wi-Fi", "Restaurant", "AC", "Pool"],
    contact: "+91-734-2557711",
    distance: "2km",
  },
  {
    id: "hotel_2",
    name: "Hotel Imperial",
    type: "hotel",
    position: { lat: 23.1851, lng: 75.7725 },
    amenities: ["Wi-Fi", "AC", "Room Service"],
    contact: "+91-734-2560560",
    distance: "1km",
  },
  {
    id: "hotel_3",
    name: "Hotel Abika Elite",
    type: "hotel",
    position: { lat: 23.168, lng: 75.7901 },
    amenities: ["Wi-Fi", "Restaurant", "Parking"],
    contact: "+91-91091-09121",
    distance: "3km",
  },
];

export const emergencyFacilities: EmergencyService[] = [
  {
    id: "emer_1",
    name: "District Hospital",
    type: "emergency",
    serviceType: "hospital",
    position: { lat: 23.1789, lng: 75.7752 },
    contact: "102",
  },
  {
    id: "emer_2",
    name: "Police Control Room",
    type: "emergency",
    serviceType: "police",
    position: { lat: 23.1820, lng: 75.7801 },
    contact: "100",
  },
  {
    id: "emer_3",
    name: "Fire Station Ujjain",
    type: "emergency",
    serviceType: "fire",
    position: { lat: 23.1751, lng: 75.7702 },
    contact: "101",
  },
  {
    id: "emer_4",
    name: "RD Gardi Medical College",
    type: "emergency",
    serviceType: "hospital",
    position: { lat: 23.201, lng: 75.795 },
    contact: "+91-734-4015000",
  },
];

export const initialFacilities: AnyFacility[] = [
    ...parkingFacilities,
    ...hotelFacilities,
    ...emergencyFacilities
];
