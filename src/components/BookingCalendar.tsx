import { useState } from "react";

interface BookedRange {
  from: Date;
  to: Date;
}

interface BookingCalendarProps {
  pricePerNight: number;
  maxGuests: number;
  bookedRanges?: BookedRange[];
  loading?: boolean;
  onBook: (
    checkIn: Date,
    checkOut: Date,
    nights: number,
    total: number,
    guests: number,
  ) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, start: Date, end: Date) {
  const d = date.getTime();
  return d > start.getTime() && d < end.getTime();
}

// A day is booked if it falls within [from, to) — checkout day is free
function isDayBooked(date: Date, ranges: BookedRange[]): boolean {
  const d = date.getTime();
  return ranges.some((r) => d >= r.from.getTime() && d < r.to.getTime());
}

// Check if a proposedf range [from, to] overlaps any booked range
function rangeOverlapsBooking(
  from: Date,
  to: Date,
  ranges: BookedRange[],
): boolean {
  return ranges.some((r) => from < r.to && r.from < to);
}

export function BookingCalendar({
  pricePerNight,
  maxGuests,
  bookedRanges = [],
  loading = false,
  onBook,
}: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [overlapError, setOverlapError] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function handleDayClick(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0, 0, 0, 0);
    if (clicked < today) return;
    if (isDayBooked(clicked, bookedRanges)) return;

    setOverlapError(false);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
    } else {
      if (clicked <= checkIn) {
        setCheckIn(clicked);
        setCheckOut(null);
      } else {
        // Check if the range overlaps any booking
        if (rangeOverlapsBooking(checkIn, clicked, bookedRanges)) {
          setOverlapError(true);
          setCheckIn(clicked);
          setCheckOut(null);
        } else {
          setCheckOut(clicked);
        }
      }
    }
  }

  function getDayClass(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isBooked = isDayBooked(date, bookedRanges);
    const isCheckIn = checkIn && isSameDay(date, checkIn);
    const isCheckOut = checkOut && isSameDay(date, checkOut);
    const isInRange = checkIn && checkOut && isBetween(date, checkIn, checkOut);
    const isHoverRange =
      checkIn &&
      !checkOut &&
      hovered &&
      hovered > checkIn &&
      isBetween(date, checkIn, hovered) &&
      !isDayBooked(date, bookedRanges);
    const isToday = isSameDay(date, today);

    const base =
      "w-9 h-9 flex items-center justify-center rounded-full text-sm font-thin transition-all select-none ";

    if (isPast) return base + "text-gray-300 cursor-not-allowed";
    if (isBooked)
      return base + "bg-red-50 text-red-300 cursor-not-allowed line-through";
    if (isCheckIn || isCheckOut)
      return base + "bg-secondary text-white font-normal cursor-pointer";
    if (isInRange || isHoverRange)
      return base + "bg-secondary/20 text-primary rounded-none cursor-pointer";
    if (isToday)
      return (
        base + "ring-2 ring-secondary text-secondary font-normal cursor-pointer"
      );
    return base + "text-primary hover:bg-secondary/10 cursor-pointer";
  }

  const nights =
    checkIn && checkOut
      ? Math.round(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;
  const total = nights * pricePerNight;

  function formatDate(d: Date) {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      {bookedRanges.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-primary/50">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-secondary inline-block" />
            Your selection
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-200 inline-block" />
            Already booked
          </span>
        </div>
      )}

      {/* Calendar card */}
      <div className="border border-primary/20 rounded-2xl p-4 shadow-sm">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-primary transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <span className="font-normal text-primary text-sm">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-primary transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs text-primary/50 font-normal pb-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(viewYear, viewMonth, day);
            date.setHours(0, 0, 0, 0);
            const isPast = date < today;
            const isBooked = isDayBooked(date, bookedRanges);
            return (
              <div
                key={day}
                className="flex justify-center"
                onMouseEnter={() => !isPast && !isBooked && setHovered(date)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleDayClick(day)}
              >
                <div className={getDayClass(day)}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlap error */}
      {overlapError && (
        <p className="text-xs text-red-500 text-center">
          That range includes already booked dates — please choose different
          dates.
        </p>
      )}

      {/* Selection summary */}
      <div className="flex gap-3">
        <div className="flex-1 border border-primary/20 rounded-xl p-3">
          <p className="text-xs text-primary/50 mb-1">Check-in</p>
          <p className="text-sm text-primary font-normal">
            {checkIn ? formatDate(checkIn) : "Select date"}
          </p>
        </div>
        <div className="flex-1 border border-primary/20 rounded-xl p-3">
          <p className="text-xs text-primary/50 mb-1">Check-out</p>
          <p className="text-sm text-primary font-normal">
            {checkOut ? formatDate(checkOut) : "Select date"}
          </p>
        </div>
      </div>

      {/* Guests */}
      <div className="border border-primary/20 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-primary/50">Guests</p>
          <p className="text-xs text-primary/40">Max {maxGuests}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <span className="text-sm font-normal text-primary w-4 text-center">
            {guests}
          </span>
          <button
            onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
            className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Price summary */}
      {nights > 0 && (
        <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-primary/60 font-thin">
              ${pricePerNight}/night × {nights} night{nights > 1 ? "s" : ""}
            </p>
            <p className="text-lg font-normal text-primary mt-1">
              Total: ${total}
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 text-secondary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
      )}

      {/* Book button */}
      <button
        disabled={!checkIn || !checkOut || loading}
        onClick={() => {
          if (checkIn && checkOut)
            onBook(checkIn, checkOut, nights, total, guests);
        }}
        className="w-full py-3 rounded-full bg-secondary text-white font-normal text-base tracking-wide transition-all hover:bg-secondary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Booking..." : "Book now!"}
      </button>
    </div>
  );
}
