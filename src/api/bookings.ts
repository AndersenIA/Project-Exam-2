const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY as string;

function headers(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Noroff-API-Key": API_KEY,
  };
}

export interface BookingPayload {
  dateFrom: string;
  dateTo: string;
  guests: number;
  venueId: string;
}

export interface BookingResult {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  created: string;
  updated: string;
}

export async function deleteBooking(id: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/holidaze/bookings/${id}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.errors?.[0]?.message ?? "Failed to cancel booking");
  }
}

export async function createBooking(
  token: string,
  payload: BookingPayload,
): Promise<BookingResult> {
  const res = await fetch(`${BASE_URL}/holidaze/bookings`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.errors?.[0]?.message ?? "Failed to create booking");
  }
  const json = await res.json();
  return json.data;
}
