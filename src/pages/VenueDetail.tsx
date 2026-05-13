import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getVenue, type Venue, type VenueMeta } from "../api/venues";
import { createBooking } from "../api/bookings";
import { useAuth } from "../context/AuthContext";
import { BookingCalendar } from "../components/BookingCalendar";

const AMENITY_LABELS: Record<keyof VenueMeta, string> = {
  wifi: "Free WiFi",
  parking: "Parking",
  breakfast: "Breakfast included",
  pets: "Pet friendly",
};

export function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const [booked, setBooked] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    checkIn: Date;
    checkOut: Date;
    nights: number;
    total: number;
    guests: number;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    getVenue(id)
      .then(setVenue)
      .catch(() => setError("Could not load venue."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen font-kulim text-primary/40 gap-3">
        <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm">Loading venue...</span>
      </main>
    );
  }

  if (error || !venue) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen font-kulim text-primary gap-4">
        <p className="text-xl">{error ?? "Venue not found."}</p>
        <Link to="/venues" className="text-secondary underline">Back to venues</Link>
      </main>
    );
  }

  const activeAmenities = (Object.keys(AMENITY_LABELS) as (keyof VenueMeta)[]).filter(
    (key) => venue.meta[key],
  );

  async function handleBook(
    checkIn: Date,
    checkOut: Date,
    nights: number,
    total: number,
    guests: number,
  ) {
    if (!user) return;
    setBookingError(null);
    setBookingLoading(true);
    try {
      await createBooking(user.accessToken, {
        venueId: venue!.id,
        dateFrom: checkIn.toISOString(),
        dateTo: checkOut.toISOString(),
        guests,
      });
      setBookingDetails({ checkIn, checkOut, nights, total, guests });
      setBooked(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  if (booked && bookingDetails) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen font-kulim text-primary px-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-secondary">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl text-center">Booking confirmed!</h2>
        <div className="border border-primary/20 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-3 text-sm">
          <p className="font-normal text-base">{venue.name}</p>
          <hr className="border-primary/10" />
          <div className="flex justify-between">
            <span className="text-primary/60">Check-in</span>
            <span>{bookingDetails.checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary/60">Check-out</span>
            <span>{bookingDetails.checkOut.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary/60">Duration</span>
            <span>{bookingDetails.nights} night{bookingDetails.nights > 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary/60">Guests</span>
            <span>{bookingDetails.guests}</span>
          </div>
          <hr className="border-primary/10" />
          <div className="flex justify-between font-normal">
            <span>Total</span>
            <span className="text-secondary">${bookingDetails.total}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/venues" className="text-secondary underline text-sm">Browse more venues</Link>
          <button onClick={() => navigate("/profile")} className="text-secondary underline text-sm cursor-pointer">
            My bookings
          </button>
        </div>
      </main>
    );
  }

  const heroImage = venue.media[0]?.url ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";
  const heroAlt = venue.media[0]?.alt ?? venue.name;

  return (
    <main className="flex flex-col font-kulim font-thin min-h-screen bg-white">
      {/* Back button */}
      <div className="fixed top-20 left-4 z-40">
        <Link
          to="/venues"
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 mt-4 text-primary text-sm shadow-sm border border-primary/10 hover:bg-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-72 md:h-96 mt-16 overflow-hidden">
        <img src={heroImage} alt={heroAlt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
      </div>

      {/* Content card */}
      <div className="relative bg-white rounded-t-3xl -mt-6 flex-1 px-6 pt-6 pb-16 max-w-2xl w-full mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Venue header */}
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-normal text-primary">{venue.name}</h1>
          <div className="flex items-center gap-1 text-secondary mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
            </svg>
            <span className="font-normal text-sm">{venue.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-primary/70 text-sm mb-1">${venue.price}/night</p>
        {venue.location.city && (
          <p className="text-primary/50 text-xs mb-4">
            {[venue.location.city, venue.location.country].filter(Boolean).join(", ")}
          </p>
        )}

        <hr className="border-primary/10 mb-5" />

        {/* Description */}
        <div className="mb-8">
          <h2 className="font-normal text-primary mb-2">Description</h2>
          <p className="text-sm text-primary/80 leading-relaxed whitespace-pre-line">{venue.description}</p>
        </div>

        {/* Amenities */}
        {activeAmenities.length > 0 && (
          <div className="mb-8">
            <h2 className="font-normal text-primary mb-3">What's included</h2>
            <div className="grid grid-cols-2 gap-2">
              {activeAmenities.map((key) => (
                <div key={key} className="flex items-center gap-2 text-sm text-primary/70">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-secondary shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {AMENITY_LABELS[key]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking section */}
        <div>
          <h2 className="font-normal text-primary mb-4">Book your stay</h2>
          {user ? (
            <>
              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {bookingError}
                </div>
              )}
              <BookingCalendar
                pricePerNight={venue.price}
                maxGuests={venue.maxGuests}
                bookedRanges={venue.bookings?.map((b) => ({
                  from: new Date(b.dateFrom),
                  to: new Date(b.dateTo),
                }))}
                onBook={handleBook}
                loading={bookingLoading}
              />
            </>
          ) : (
            <div className="border border-primary/10 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-primary/60">You need to be logged in to book this venue.</p>
              <Link
                to="/login"
                className="px-6 py-2.5 bg-secondary text-white rounded-full text-sm font-normal hover:bg-secondary/90 transition-colors"
              >
                Log in to book
              </Link>
              <p className="text-xs text-primary/40">
                Don't have an account?{" "}
                <Link to="/register" className="text-secondary underline">Register here</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
