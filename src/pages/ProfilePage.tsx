import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import {
  getProfileVenues,
  getProfileBookings,
  updateProfile,
  deleteVenue,
  createVenue,
  updateVenue,
  type Booking,
  type VenueFormData,
} from "../api/profiles";
import { deleteBooking } from "../api/bookings";
import type { Venue } from "../api/venues";

// ─── Bookings calendar (read-only overview) ───────────────────────────────────

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

function MyBookingsCalendar({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const ranges = bookings.map((b) => ({
    from: new Date(new Date(b.dateFrom).setHours(0, 0, 0, 0)),
    to: new Date(new Date(b.dateTo).setHours(0, 0, 0, 0)),
    venueName: b.venue?.name ?? "",
  }));

  function getDayState(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    const match = ranges.find((r) => date >= r.from && date <= r.to);
    const isStart = ranges.some((r) => date.getTime() === r.from.getTime());
    const isEnd = ranges.some((r) => date.getTime() === r.to.getTime());
    return {
      isBooked: !!match,
      isStart,
      isEnd,
      isToday,
      venueName: match?.venueName ?? "",
    };
  }

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

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  return (
    <div className="border border-primary/20 rounded-2xl p-4 shadow-sm">
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
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { isBooked, isStart, isEnd, isToday, venueName } =
            getDayState(day);
          let cls =
            "w-9 h-9 flex items-center justify-center text-sm font-thin select-none transition-all ";
          if (isStart || isEnd)
            cls += "bg-secondary text-white rounded-full font-normal";
          else if (isBooked) cls += "bg-secondary/20 text-primary rounded-none";
          else if (isToday)
            cls += "border border-secondary text-secondary rounded-full";
          else cls += "text-primary/70 rounded-full";
          return (
            <div
              key={day}
              className="flex justify-center"
              title={isBooked ? venueName : undefined}
            >
              <div className={cls}>{day}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-primary/50 mt-4 pt-3 border-t border-primary/10">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-secondary inline-block" />
          Booked by you
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-secondary inline-block" />
          Today
        </span>
      </div>
    </div>
  );
}

// ─── Venue form (create / edit) ───────────────────────────────────────────────

const EMPTY_FORM: VenueFormData = {
  name: "",
  description: "",
  price: 0,
  maxGuests: 1,
  media: [{ url: "", alt: "" }],
  meta: { wifi: false, parking: false, breakfast: false, pets: false },
  location: { address: "", city: "", country: "" },
};

function VenueForm({
  initial,
  onSave,
  onCancel,
  loading,
  error,
}: {
  initial: VenueFormData;
  onSave: (data: VenueFormData) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<VenueFormData>(initial);

  function set<K extends keyof VenueFormData>(key: K, value: VenueFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setMeta(
    key: keyof NonNullable<VenueFormData["meta"]>,
    value: boolean,
  ) {
    setForm((prev) => ({ ...prev, meta: { ...prev.meta!, [key]: value } }));
  }

  function setLocation(
    key: keyof NonNullable<VenueFormData["location"]>,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value },
    }));
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const cleaned: VenueFormData = {
      ...form,
      media: form.media?.filter((m) => m.url.trim()) ?? [],
    };
    onSave(cleaned);
  }

  const inputCls =
    "border border-primary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors";
  const labelCls = "text-sm text-primary/70 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Venue name *</label>
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          placeholder="My lovely cabin"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Description *</label>
        <textarea
          className={`${inputCls} resize-none h-24`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
          placeholder="Describe the venue..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Price per night (kr) *</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            value={form.price === 0 ? "" : form.price}
            onChange={(e) =>
              set("price", e.target.value === "" ? 0 : Number(e.target.value))
            }
            placeholder="0"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Max guests *</label>
          <input
            className={inputCls}
            type="number"
            min={1}
            value={form.maxGuests === 0 ? "" : form.maxGuests}
            onChange={(e) =>
              set(
                "maxGuests",
                e.target.value === "" ? 0 : Number(e.target.value),
              )
            }
            placeholder="1"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelCls}>Images</label>
        {(form.media ?? [{ url: "", alt: "" }]).map((img, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className={`${inputCls} flex-1`}
              type="url"
              value={img.url}
              onChange={(e) => {
                const updated = [...(form.media ?? [])];
                updated[i] = {
                  url: e.target.value,
                  alt: form.name || "Venue image",
                };
                set("media", updated);
              }}
              placeholder="https://example.com/image.jpg"
            />
            {(form.media ?? []).length > 1 && (
              <button
                type="button"
                onClick={() =>
                  set(
                    "media",
                    (form.media ?? []).filter((_, idx) => idx !== i),
                  )
                }
                className="text-primary/40 hover:text-red-400 transition-colors shrink-0"
                aria-label="Remove image"
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        {(form.media ?? []).length < 8 && (
          <button
            type="button"
            onClick={() =>
              set("media", [...(form.media ?? []), { url: "", alt: "" }])
            }
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors w-fit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add image
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Location</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            className={inputCls}
            value={form.location?.address ?? ""}
            onChange={(e) => setLocation("address", e.target.value)}
            placeholder="Address"
          />
          <input
            className={inputCls}
            value={form.location?.city ?? ""}
            onChange={(e) => setLocation("city", e.target.value)}
            placeholder="City"
          />
          <input
            className={inputCls}
            value={form.location?.country ?? ""}
            onChange={(e) => setLocation("country", e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelCls}>Amenities</label>
        <div className="flex flex-wrap gap-3">
          {(["wifi", "parking", "breakfast", "pets"] as const).map((key) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.meta?.[key] ?? false}
                onChange={(e) => setMeta(key, e.target.checked)}
                className="accent-secondary"
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-secondary text-white rounded-xl text-sm disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save venue"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-primary/20 rounded-xl text-sm text-primary hover:border-secondary hover:text-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main profile page ────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [tab, setTab] = useState<"venues" | "bookings">(
    searchParams.get("tab") === "bookings" ? "bookings" : "venues",
  );

  // Avatar edit
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // venueManager toggle
  const [roleLoading, setRoleLoading] = useState(false);

  // Venue CRUD
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueFormLoading, setVenueFormLoading] = useState(false);
  const [venueFormError, setVenueFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [deleteVenueConfirmId, setDeleteVenueConfirmId] = useState<
    string | null
  >(null);

  function requestCancelBooking(id: string, dateFrom: string) {
    const checkIn = new Date(dateFrom);
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    if (checkIn < twoDaysFromNow) return;
    setCancelConfirmId(id);
  }

  async function confirmCancelBooking() {
    if (!cancelConfirmId) return;
    const id = cancelConfirmId;
    setCancelConfirmId(null);
    setCancellingId(id);
    try {
      await deleteBooking(id, user!.accessToken);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const load = async () => {
      setDataLoading(true);
      try {
        const [b, v] = await Promise.all([
          getProfileBookings(user.name, user.accessToken),
          user.venueManager
            ? getProfileVenues(user.name, user.accessToken)
            : Promise.resolve([]),
        ]);
        setBookings(b);
        setVenues(v);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [user, navigate]);

  if (!user) return null;

  // ── Avatar update ──
  async function handleAvatarSave() {
    if (!avatarUrl.trim()) return;
    setAvatarLoading(true);
    setAvatarError(null);
    try {
      const updated = await updateProfile(user!.name, user!.accessToken, {
        avatar: { url: avatarUrl.trim(), alt: user!.name },
      });
      updateUser({ avatar: updated.avatar });
      setEditingAvatar(false);
      setAvatarUrl("");
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Failed to update avatar",
      );
    } finally {
      setAvatarLoading(false);
    }
  }

  // ── venueManager toggle ──
  async function handleRoleToggle() {
    setRoleLoading(true);
    try {
      const updated = await updateProfile(user!.name, user!.accessToken, {
        venueManager: !user!.venueManager,
      });
      updateUser({ venueManager: updated.venueManager });
      setTab(updated.venueManager ? "venues" : "bookings");
      const [b, v] = await Promise.all([
        getProfileBookings(user!.name, user!.accessToken),
        updated.venueManager
          ? getProfileVenues(user!.name, user!.accessToken)
          : Promise.resolve([]),
      ]);
      setBookings(b);
      setVenues(v);
    } finally {
      setRoleLoading(false);
    }
  }

  // ── Delete venue ──
  async function confirmDeleteVenue() {
    if (!deleteVenueConfirmId) return;
    const id = deleteVenueConfirmId;
    setDeleteVenueConfirmId(null);
    setDeletingId(id);
    try {
      await deleteVenue(id, user!.accessToken);
      setVenues((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Create / update venue ──
  async function handleVenueSave(data: VenueFormData) {
    setVenueFormLoading(true);
    setVenueFormError(null);
    try {
      if (editingVenue) {
        const updated = await updateVenue(
          editingVenue.id,
          user!.accessToken,
          data,
        );
        setVenues((prev) =>
          prev.map((v) => (v.id === updated.id ? updated : v)),
        );
      } else {
        const created = await createVenue(user!.accessToken, data);
        setVenues((prev) => [created, ...prev]);
      }
      setShowVenueForm(false);
      setEditingVenue(null);
    } catch (err) {
      setVenueFormError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setVenueFormLoading(false);
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.dateTo) >= new Date(),
  );

  return (
    <main className="flex flex-col mt-20 font-kulim font-thin min-h-screen pb-24">
      {cancelConfirmId && (
        <ConfirmModal
          title="Cancel booking"
          message="Are you sure you want to cancel this booking? This cannot be undone."
          confirmLabel="Yes, cancel"
          onConfirm={confirmCancelBooking}
          onCancel={() => setCancelConfirmId(null)}
        />
      )}
      {deleteVenueConfirmId && (
        <ConfirmModal
          title="Delete venue"
          message="Are you sure you want to delete this venue? This cannot be undone."
          confirmLabel="Yes, delete"
          onConfirm={confirmDeleteVenue}
          onCancel={() => setDeleteVenueConfirmId(null)}
        />
      )}
      {/* Profile header */}
      <section className="px-6 py-8 border-b border-primary/10">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={
                  user.avatar?.url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                }
                alt={user.avatar?.alt || user.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-secondary/30"
              />
              <button
                onClick={() => {
                  setEditingAvatar(true);
                  setAvatarUrl(user.avatar?.url ?? "");
                }}
                className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full w-7 h-7 flex items-center justify-center shadow cursor-pointer"
                title="Update avatar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-normal text-primary">{user.name}</h1>
              <p className="text-sm text-primary/60">{user.email}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user.venueManager ? "bg-secondary/10 text-secondary" : "bg-primary/5 text-primary/50"}`}
              >
                {user.venueManager ? "Venue manager" : "Customer"}
              </span>
            </div>
          </div>

          {/* Avatar edit form */}
          {editingAvatar && (
            <div className="border border-primary/10 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-sm font-normal text-primary">
                Update profile picture
              </p>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="border border-primary/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary"
              />
              {avatarError && (
                <p className="text-red-500 text-xs">{avatarError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAvatarSave}
                  disabled={avatarLoading}
                  className="flex-1 py-2 bg-secondary text-white rounded-xl text-sm disabled:opacity-60"
                >
                  {avatarLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingAvatar(false)}
                  className="flex-1 py-2 border border-primary/20 rounded-xl text-sm text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Role toggle */}
          <div className="flex items-center justify-between border border-primary/10 rounded-2xl px-4 py-3">
            <div>
              <p className="text-sm font-normal text-primary">Venue manager</p>
              <p className="text-xs text-primary/50">
                {user.venueManager
                  ? "You can create and manage venues"
                  : "Enable to create and manage your own venues"}
              </p>
            </div>
            <button
              onClick={handleRoleToggle}
              disabled={roleLoading}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-60 ${user.venueManager ? "bg-secondary" : "bg-primary/20"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${user.venueManager ? "translate-x-5" : ""}`}
              />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate("/home");
            }}
            className="text-sm text-primary/50 hover:text-primary underline w-fit"
          >
            Log out
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Tabs — only shown for venue managers */}
        {user.venueManager && (
          <div className="flex border-b border-primary/10 mb-6">
            {(["venues", "bookings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm capitalize transition-colors cursor-pointer border-b-2 -mb-px ${
                  tab === t
                    ? "border-secondary text-secondary font-normal"
                    : "border-transparent text-primary/50 hover:text-primary"
                }`}
              >
                {t === "venues" ? "My venues" : "My bookings"}
              </button>
            ))}
          </div>
        )}

        {user.venueManager && tab === "venues" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-normal text-primary">My venues</h2>
              <button
                onClick={() => {
                  setShowVenueForm(true);
                  setEditingVenue(null);
                  setVenueFormError(null);
                }}
                className="flex items-center gap-2 bg-secondary text-white text-sm px-4 py-2 rounded-xl cursor-pointer"
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
                New venue
              </button>
            </div>

            {/* Create / edit form */}
            {showVenueForm && (
              <div className="border border-primary/10 rounded-2xl p-5 mb-6">
                <h3 className="font-normal text-primary mb-4">
                  {editingVenue ? "Edit venue" : "Create new venue"}
                </h3>
                <VenueForm
                  initial={
                    editingVenue
                      ? {
                          name: editingVenue.name,
                          description: editingVenue.description,
                          price: editingVenue.price,
                          maxGuests: editingVenue.maxGuests,
                          media: editingVenue.media.length
                            ? editingVenue.media
                            : [{ url: "", alt: "" }],
                          meta: editingVenue.meta,
                          location: editingVenue.location,
                        }
                      : EMPTY_FORM
                  }
                  onSave={handleVenueSave}
                  onCancel={() => {
                    setShowVenueForm(false);
                    setEditingVenue(null);
                  }}
                  loading={venueFormLoading}
                  error={venueFormError}
                />
              </div>
            )}

            {dataLoading ? (
              <p className="text-sm text-primary/40">Loading venues...</p>
            ) : venues.length === 0 ? (
              <p className="text-sm text-primary/40">
                You haven't created any venues yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="border border-primary/10 rounded-2xl overflow-hidden"
                  >
                    <div className="flex gap-4">
                      <Link
                        to={`/venues/${venue.id}`}
                        className="shrink-0 w-24 self-stretch overflow-hidden"
                      >
                        <img
                          src={
                            venue.media[0]?.url ??
                            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
                          }
                          alt={venue.media[0]?.alt ?? venue.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="flex-1 py-3 pr-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              to={`/venues/${venue.id}`}
                              className="font-normal text-primary hover:text-secondary truncate block"
                            >
                              {venue.name}
                            </Link>
                            <p className="text-xs text-primary/50">
                              ${venue.price}/night · max {venue.maxGuests}{" "}
                              guests
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingVenue(venue);
                                setShowVenueForm(true);
                                setVenueFormError(null);
                              }}
                              className="text-xs text-secondary border border-secondary/30 rounded-lg px-2 py-1 hover:bg-secondary/5 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteVenueConfirmId(venue.id)}
                              disabled={deletingId === venue.id}
                              className="text-xs text-red-400 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === venue.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                        {/* Upcoming bookings for this venue */}
                        {(
                          venue as Venue & {
                            bookings?: {
                              dateFrom: string;
                              dateTo: string;
                              guests: number;
                            }[];
                          }
                        ).bookings?.filter(
                          (b) => new Date(b.dateTo) >= new Date(),
                        ).length ? (
                          <div className="mt-2 border-t border-primary/5 pt-2">
                            <p className="text-xs text-primary/40 mb-1">
                              Upcoming bookings
                            </p>
                            {(
                              venue as Venue & {
                                bookings?: {
                                  dateFrom: string;
                                  dateTo: string;
                                  guests: number;
                                }[];
                              }
                            )
                              .bookings!.filter(
                                (b) => new Date(b.dateTo) >= new Date(),
                              )
                              .slice(0, 3)
                              .map((b, i) => (
                                <p key={i} className="text-xs text-primary/60">
                                  {new Date(b.dateFrom).toLocaleDateString(
                                    "en-GB",
                                    { day: "numeric", month: "short" },
                                  )}
                                  {" – "}
                                  {new Date(b.dateTo).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                  {" · "}
                                  {b.guests} guest{b.guests > 1 ? "s" : ""}
                                </p>
                              ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {!user.venueManager && (
              <h2 className="text-xl font-normal text-primary mb-6">
                My bookings
              </h2>
            )}
            {!dataLoading && bookings.length > 0 && (
              <div className="mb-6">
                <MyBookingsCalendar bookings={bookings} />
              </div>
            )}
            {dataLoading ? (
              <p className="text-sm text-primary/40">Loading bookings...</p>
            ) : upcomingBookings.length === 0 ? (
              <div className="flex flex-col gap-3 text-primary/40">
                <p className="text-sm">No upcoming bookings.</p>
                <Link to="/venues" className="text-secondary underline text-sm">
                  Browse venues
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs text-primary/40 -mt-2 mb-2">
                  Free cancellation up to 2 days before check-in.
                </p>
                <div className="flex flex-col gap-4">
                  {upcomingBookings.map((booking) => {
                    const checkIn = new Date(booking.dateFrom);
                    const twoDaysFromNow = new Date();
                    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
                    twoDaysFromNow.setHours(0, 0, 0, 0);
                    const canCancel = checkIn >= twoDaysFromNow;
                    return (
                      <div
                        key={booking.id}
                        className="border border-primary/10 rounded-2xl overflow-hidden flex gap-4"
                      >
                        {booking.venue && (
                          <Link
                            to={`/venues/${booking.venue.id}`}
                            className="shrink-0 w-24 self-stretch overflow-hidden"
                          >
                            <img
                              src={
                                booking.venue.media[0]?.url ??
                                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
                              }
                              alt={booking.venue.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        )}
                        <div className="py-3 pr-3 flex flex-col justify-center gap-1 flex-1">
                          {booking.venue && (
                            <Link
                              to={`/venues/${booking.venue.id}`}
                              className="font-normal text-primary hover:text-secondary text-sm"
                            >
                              {booking.venue.name}
                            </Link>
                          )}
                          <p className="text-xs text-primary/60">
                            {new Date(booking.dateFrom).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short" },
                            )}
                            {" – "}
                            {new Date(booking.dateTo).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-primary/50">
                            {booking.guests} guest
                            {booking.guests > 1 ? "s" : ""}
                          </p>
                          <button
                            onClick={() =>
                              requestCancelBooking(booking.id, booking.dateFrom)
                            }
                            disabled={!canCancel || cancellingId === booking.id}
                            className="mt-1 text-xs w-fit text-red-400 hover:text-red-500 disabled:text-primary/20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={
                              !canCancel
                                ? "Cannot cancel within 2 days of check-in"
                                : undefined
                            }
                          >
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : canCancel
                                ? "Cancel booking"
                                : "Non-refundable"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
