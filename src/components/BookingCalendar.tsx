import { useState } from "react";

interface BookingCalendarProps {
  pricePerNight: number;
  onBook: (checkIn: Date, checkOut: Date, nights: number, total: number) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

export function BookingCalendar({ pricePerNight, onBook }: BookingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<Date | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleDayClick(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    if (clicked < today && !isSameDay(clicked, today)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
    } else {
      if (clicked <= checkIn) {
        setCheckIn(clicked);
        setCheckOut(null);
      } else {
        setCheckOut(clicked);
      }
    }
  }

  function getDayClass(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    const isPast = date < today && !isSameDay(date, today);
    const isCheckIn = checkIn && isSameDay(date, checkIn);
    const isCheckOut = checkOut && isSameDay(date, checkOut);
    const isInRange =
      checkIn && checkOut && isBetween(date, checkIn, checkOut);
    const isHoverRange =
      checkIn &&
      !checkOut &&
      hovered &&
      hovered > checkIn &&
      isBetween(date, checkIn, hovered);
    const isToday = isSameDay(date, today);

    let base =
      "w-9 h-9 flex items-center justify-center rounded-full text-sm font-thin transition-all cursor-pointer select-none ";

    if (isPast) return base + "text-gray-300 cursor-not-allowed";
    if (isCheckIn || isCheckOut)
      return base + "bg-secondary text-white font-normal";
    if (isInRange || isHoverRange)
      return base + "bg-secondary/20 text-primary rounded-none";
    if (isToday) return base + "border border-secondary text-secondary";
    return base + "text-primary hover:bg-secondary/10";
  }

  const nights =
    checkIn && checkOut
      ? Math.round(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
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
      {/* Calendar card */}
      <div className="border border-primary/20 rounded-2xl p-4 shadow-sm">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="font-normal text-primary text-sm">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-primary/50 font-normal pb-1">
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
            const isPast = date < today && !isSameDay(date, today);
            return (
              <div
                key={day}
                className="flex justify-center"
                onMouseEnter={() => !isPast && setHovered(date)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleDayClick(day)}
              >
                <div className={getDayClass(day)}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>

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

      {/* Price summary */}
      {nights > 0 && (
        <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-primary/60 font-thin">
              ${pricePerNight}/night × {nights} night{nights > 1 ? "s" : ""}
            </p>
            <p className="text-lg font-normal text-primary mt-1">Total: ${total}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-secondary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
      )}

      {/* Book button */}
      <button
        disabled={!checkIn || !checkOut}
        onClick={() => {
          if (checkIn && checkOut) onBook(checkIn, checkOut, nights, total);
        }}
        className="w-full py-3 rounded-full bg-secondary text-white font-normal text-base tracking-wide transition-all hover:bg-secondary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Book now!
      </button>
    </div>
  );
}
