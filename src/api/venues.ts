const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface VenueMeta {
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
}

export interface VenueLocation {
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  continent: string | null;
  lat: number;
  lng: number;
}

export interface VenueMedia {
  url: string;
  alt: string;
}

export interface VenueBooking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  media: VenueMedia[];
  price: number;
  maxGuests: number;
  rating: number;
  created: string;
  updated: string;
  meta: VenueMeta;
  location: VenueLocation;
  bookings?: VenueBooking[];
}

interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export async function getVenues(): Promise<Venue[]> {
  const res = await fetch(`${BASE_URL}/holidaze/venues?limit=100&sort=created&sortOrder=desc`);
  if (!res.ok) throw new Error("Failed to fetch venues");
  const json: ApiResponse<Venue[]> = await res.json();
  return json.data;
}

export async function getVenue(id: string): Promise<Venue> {
  const res = await fetch(`${BASE_URL}/holidaze/venues/${id}?_bookings=true`);
  if (!res.ok) throw new Error("Failed to fetch venue");
  const json: ApiResponse<Venue> = await res.json();
  return json.data;
}

export async function searchVenues(query: string): Promise<Venue[]> {
  const res = await fetch(
    `${BASE_URL}/holidaze/venues/search?q=${encodeURIComponent(query)}&limit=100`,
  );
  if (!res.ok) throw new Error("Failed to search venues");
  const json: ApiResponse<Venue[]> = await res.json();
  return json.data;
}
