import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getVenue, type Venue, type VenueMeta } from "../api/venues";
import { createBooking } from "../api/bookings";
import { useAuth } from "../context/AuthContext";
import { BookingCalendar } from "../components/BookingCalendar";

function ImageLightbox({ media, startIndex, venueName, onClose }: {
  media: { url: string; alt: string }[];
  startIndex: number;
  venueName: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((i) => (i - 1 + media.length) % media.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((i) => (i + 1) % media.length); };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + media.length) % media.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % media.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [media.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full max-w-4xl px-12 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={media[index].url}
          alt={media[index].alt || venueName}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
        {media.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors cursor-pointer" aria-label="Previous">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button onClick={next} className="absolute right-2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors cursor-pointer" aria-label="Next">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          {media.map((img, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === index ? "border-white" : "border-transparent opacity-50 hover:opacity-80"}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="text-white/50 text-xs mt-3">{index + 1} / {media.length} — click outside or press Esc to close</p>
    </div>
  );
}

function HeroCarousel({ media, venueName }: { media: { url: string; alt: string }[]; venueName: string }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((i) => (i - 1 + media.length) % media.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((i) => (i + 1) % media.length); };

  return (
    <>
      {lightboxOpen && (
        <ImageLightbox media={media} startIndex={index} venueName={venueName} onClose={() => setLightboxOpen(false)} />
      )}
      <div className="relative w-full h-[55vh] mt-16 overflow-hidden cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        {media.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={img.alt || venueName}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

        <div className="absolute top-8 right-4 bg-black/30 backdrop-blur-sm text-white text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          View all
        </div>

        {media.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition-colors" aria-label="Previous image">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-white transition-colors" aria-label="Next image">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
              {media.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }} className={`rounded-full transition-all ${i === index ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"}`} aria-label={`Go to image ${i + 1}`} />
              ))}
            </div>
            <span className="absolute bottom-8 right-4 text-white/80 text-xs bg-black/30 rounded-full px-2 py-0.5">
              {index + 1} / {media.length}
            </span>
          </>
        )}
      </div>
    </>
  );
}

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

  const media = venue.media.length > 0
    ? venue.media
    : [{ url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", alt: venue.name }];

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

      {/* Hero carousel */}
      <HeroCarousel media={media} venueName={venue.name} />

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
