import type { Venue } from "./venues";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY as string;

function headers(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Noroff-API-Key": API_KEY,
  };
}

export interface Booking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  created: string;
  updated: string;
  venue?: Venue;
}

export interface Profile {
  name: string;
  email: string;
  bio: string | null;
  avatar: { url: string; alt: string };
  banner: { url: string; alt: string };
  venueManager: boolean;
  venues?: Venue[];
  bookings?: Booking[];
}

export async function getProfile(name: string, token: string): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/holidaze/profiles/${encodeURIComponent(name)}?_venues=true&_bookings=true`,
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error("Failed to fetch profile");
  const json = await res.json();
  return json.data;
}

export async function updateProfile(
  name: string,
  token: string,
  body: { avatar?: { url: string; alt: string }; venueManager?: boolean; bio?: string },
): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/holidaze/profiles/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.errors?.[0]?.message ?? "Failed to update profile");
  }
  const json = await res.json();
  return json.data;
}

export async function getProfileVenues(name: string, token: string): Promise<Venue[]> {
  const res = await fetch(
    `${BASE_URL}/holidaze/profiles/${encodeURIComponent(name)}/venues?_bookings=true`,
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error("Failed to fetch venues");
  const json = await res.json();
  return json.data;
}

export async function getProfileBookings(name: string, token: string): Promise<Booking[]> {
  const res = await fetch(
    `${BASE_URL}/holidaze/profiles/${encodeURIComponent(name)}/bookings?_venue=true`,
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error("Failed to fetch bookings");
  const json = await res.json();
  return json.data;
}

export async function deleteVenue(id: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/holidaze/venues/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "X-Noroff-API-Key": API_KEY },
  });
  if (!res.ok) throw new Error("Failed to delete venue");
}

export async function createVenue(token: string, body: VenueFormData): Promise<Venue> {
  const res = await fetch(`${BASE_URL}/holidaze/venues`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.errors?.[0]?.message ?? "Failed to create venue");
  }
  const json = await res.json();
  return json.data;
}

export async function updateVenue(id: string, token: string, body: VenueFormData): Promise<Venue> {
  const res = await fetch(`${BASE_URL}/holidaze/venues/${id}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.errors?.[0]?.message ?? "Failed to update venue");
  }
  const json = await res.json();
  return json.data;
}

export interface VenueFormData {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  media?: { url: string; alt: string }[];
  meta?: { wifi: boolean; parking: boolean; breakfast: boolean; pets: boolean };
  location?: { address?: string; city?: string; country?: string };
}
