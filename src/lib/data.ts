
import type { Parking, Hotel, EmergencyService, AnyFacility, Temple, LostAndFound, Ghat, Akhada } from "@/types";

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
  {
    id: "park_5",
    name: "Ujjain Railway Station Parking",
    type: "parking",
    position: { lat: 23.178, lng: 75.785 },
    capacity: 300,
    occupancy: 150,
    status: 'normal',
    },
    {
    id: "park_6",
    name: "Freeganj Parking",
    type: "parking",
    position: { lat: 23.17, lng: 75.78 },
    capacity: 400,
    occupancy: 200,
    status: 'normal',
    }
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
  {
    id: "hotel_4",
    name: "Hotel Shanti Palace",
    type: "hotel",
    position: { lat: 23.180, lng: 75.791 },
    amenities: ["Wi-Fi", "Restaurant"],
    contact: "+91-734-4010100",
    distance: "2.5km",
  },
  {
    id: "hotel_5",
    name: "Hotel Atharva",
    type: "hotel",
    position: { lat: 23.165, lng: 75.788 },
    amenities: ["Wi-Fi", "AC", "Parking"],
    contact: "+91-734-2533300",
    distance: "3.5km",
  },
  {
    id: "hotel_6",
    name: "Hotel Kalpana Palace",
    type: "hotel",
    position: { lat: 23.183, lng: 75.771 },
    amenities: ["Room Service", "Parking"],
    contact: "+91-734-2553332",
    distance: "0.8km",
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
  {
    id: "emer_5",
    name: "Mahakal Police Station",
    type: "emergency",
    serviceType: "police_station",
    position: { lat: 23.1825, lng: 75.7675 },
    contact: "100"
  },
   {
    id: "emer_6",
    name: "Kotwali Police Station",
    type: "emergency",
    serviceType: "police_station",
    position: { lat: 23.1848, lng: 75.7786 },
    contact: "100"
  },
  {
    id: "emer_7",
    name: "Jiwajiganj Police Station",
    type: "emergency",
    serviceType: "police_station",
    position: { lat: 23.1901, lng: 75.7723 },
    contact: "100"
  },
  {
    id: "emer_8",
    name: "Madhav Nagar Hospital",
    type: "emergency",
    serviceType: "hospital",
    position: { lat: 23.1695, lng: 75.7891 },
    contact: "+91-734-2511255"
  },
  {
    id: "emer_9",
    name: "Charak Hospital",
    type: "emergency",
    serviceType: "hospital",
    position: { lat: 23.1852, lng: 75.7813 },
    contact: "+91-734-2550525"
  }
];

export const templeFacilities: Temple[] = [
    {
        id: "temple_1",
        name: "Mahakaleshwar Temple",
        type: "temple",
        position: { lat: 23.1828, lng: 75.7687 },
        deity: "Lord Shiva"
    },
    {
        id: "temple_2",
        name: "Harsiddhi Temple",
        type: "temple",
        position: { lat: 23.1830, lng: 75.7648 },
        deity: "Goddess Harsiddhi"
    },
    {
        id: "temple_3",
        name: "Kal Bhairav Temple",
        type: "temple",
        position: { lat: 23.1950, lng: 75.7533 },
        deity: "Lord Kal Bhairav"
    },
    {
        id: "temple_4",
        name: "Chintaman Ganesh Temple",
        type: "temple",
        position: { lat: 23.1583, lng: 75.7334 },
        deity: "Lord Ganesha"
    },
    {
        id: "temple_5",
        name: "Mangalnath Temple",
        type: "temple",
        position: { lat: 23.2038, lng: 75.7663 },
        deity: "Lord Shiva (Mangal)"
    },
    {
        id: "temple_6",
        name: "Sandipani Ashram",
        type: "temple",
        position: { lat: 23.2017, lng: 75.7725 },
        deity: "Guru Sandipani"
    }
];

export const lostAndFoundFacilities: LostAndFound[] = [
    {
        id: "lost_1",
        name: "Lost & Found Center - Ramghat",
        type: "lost_and_found",
        position: { lat: 23.1840, lng: 75.7670 },
        contact: "100"
    },
    {
        id: "lost_2",
        name: "Lost & Found Center - Mahakal Temple",
        type: "lost_and_found",
        position: { lat: 23.1818, lng: 75.7685 },
        contact: "100"
    },
    {
        id: "lost_3",
        name: "Lost & Found Center - Nanakheda",
        type: "lost_and_found",
        position: { lat: 23.1730, lng: 75.7950 },
        contact: "100"
    },
    {
        id: "lost_4",
        name: "Lost & Found Center - Triveni Mela",
        type: "lost_and_found",
        position: { lat: 23.1615, lng: 75.7635 },
        contact: "100"
    },
    {
        id: "lost_5",
        name: "Lost & Found Center - Harsiddhi",
        type: "lost_and_found",
        position: { lat: 23.1832, lng: 75.7650 },
        contact: "100"
    },
    {
        id: "lost_6",
        name: "Lost & Found Center - Railway Station",
        type: "lost_and_found",
        position: { lat: 23.1782, lng: 75.7852 },
        contact: "100"
    }
];

export const ghatFacilities: Ghat[] = [
    {
        id: "ghat_1",
        name: "Ram Ghat",
        type: "ghat",
        position: { lat: 23.1855, lng: 75.7659 },
        river: "Shipra"
    },
    {
        id: "ghat_2",
        name: "Datta Akhara Ghat",
        type: "ghat",
        position: { lat: 23.1865, lng: 75.7645 },
        river: "Shipra"
    },
    {
        id: "ghat_3",
        name: "Narsingh Ghat",
        type: "ghat",
        position: { lat: 23.1880, lng: 75.7638 },
        river: "Shipra"
    },
    {
        id: "ghat_4",
        name: "Siddhwat Ghat",
        type: "ghat",
        position: { lat: 23.2081, lng: 75.7502 },
        river: "Shipra"
    },
    {
        id: "ghat_5",
        name: "Mangalnath Ghat",
        type: "ghat",
        position: { lat: 23.2040, lng: 75.7660 },
        river: "Shipra"
    },
    {
        id: "ghat_6",
        name: "Triveni Ghat",
        type: "ghat",
        position: { lat: 23.1600, lng: 75.7620 },
        river: "Shipra"
    }
];

export const akhadaFacilities: Akhada[] = [
    {
        id: "akhada_1",
        name: "Juna Akhada",
        type: "akhada",
        position: { lat: 23.1870, lng: 75.7630 },
        sect: "Shaiva"
    },
    {
        id: "akhada_2",
        name: "Niranjani Akhada",
        type: "akhada",
        position: { lat: 23.1880, lng: 75.7620 },
        sect: "Shaiva"
    },
    {
        id: "akhada_3",
        name: "Mahanirvani Akhada",
        type: "akhada",
        position: { lat: 23.182, lng: 75.763 },
        sect: "Shaiva"
    },
    {
        id: "akhada_4",
        name: "Atal Akhada",
        type: "akhada",
        position: { lat: 23.181, lng: 75.764 },
        sect: "Shaiva"
    },
    {
        id: "akhada_5",
        name: "Avahan Akhada",
        type: "akhada",
        position: { lat: 23.189, lng: 75.761 },
        sect: "Shaiva"
    },
    {
        id: "akhada_6",
        name: "Nirmal Akhada",
        type: "akhada",
        position: { lat: 23.190, lng: 75.760 },
        sect: "Sikh"
    }
];

export const initialFacilities: AnyFacility[] = [
    ...parkingFacilities,
    ...hotelFacilities,
    ...emergencyFacilities,
    ...templeFacilities,
    ...lostAndFoundFacilities,
    ...ghatFacilities,
    ...akhadaFacilities,
];
