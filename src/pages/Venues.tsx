import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getVenues, searchVenues, type Venue, type VenueMeta } from "../api/venues";

type SortOption = "recommended" | "price-asc" | "price-desc" | "rating";
type AmenityKey = keyof VenueMeta;

const ALL_AMENITIES: { key: AmenityKey; label: string }[] = [
  { key: "wifi", label: "Free WiFi" },
  { key: "parking", label: "Parking" },
  { key: "breakfast", label: "Breakfast" },
  { key: "pets", label: "Pet friendly" },
];

const MAX_PRICE = 10000;

export function Venues() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = search.trim()
          ? await searchVenues(search.trim())
          : await getVenues();
        if (!cancelled) setVenues(data);
      } catch {
        if (!cancelled) setError("Could not load venues. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const debounce = setTimeout(load, search ? 400 : 0);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [search]);

  function toggleAmenity(key: AmenityKey) {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
    );
  }

  const filtered = useMemo(() => {
    let results = venues.filter((venue) => {
      const matchesPrice = venue.price <= maxPrice;
      const matchesRating = venue.rating >= minRating;
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((key) => venue.meta[key]);
      return matchesPrice && matchesRating && matchesAmenities;
    });

    if (sort === "price-asc")
      results = [...results].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      results = [...results].sort((a, b) => b.price - a.price);
    if (sort === "rating")
      results = [...results].sort((a, b) => b.rating - a.rating);

    return results;
  }, [venues, sort, maxPrice, minRating, selectedAmenities]);

  const activeFilterCount =
    (maxPrice < MAX_PRICE ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedAmenities.length;

  function clearFilters() {
    setMaxPrice(MAX_PRICE);
    setMinRating(0);
    setSelectedAmenities([]);
  }

  return (
    <main className="flex flex-col mt-20 font-kulim font-thin min-h-screen">
      {/* Header */}
      <section className="px-6 py-8 border-b border-primary/10">
        <h1 className="text-3xl font-normal text-primary mb-1">All venues</h1>
        <p className="text-primary/60 text-sm">
          Find your perfect place to stay
        </p>
      </section>

      {/* Search + Sort bar */}
      <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 border-b border-primary/10 bg-white sticky top-16 z-30">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 border border-primary/20 rounded-xl px-4 py-2.5 focus-within:border-secondary transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 text-primary/40 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues..."
            className="flex-1 bg-transparent text-sm text-primary placeholder-primary/40 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-primary/30 hover:text-primary/60 cursor-pointer"
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

        {/* Sort */}
        <div className="flex gap-2 shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-primary bg-white focus:outline-none focus:border-secondary transition-colors cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233e405d' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "16px",
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>

          {/* Filter toggle button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer ${filtersOpen ? "border-secondary text-secondary bg-secondary/5" : "border-primary/20 text-primary hover:border-secondary hover:text-secondary"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-normal">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="px-6 py-5 border-b border-primary/10 bg-white/95 backdrop-blur-sm">
          <div className="max-w-3xl flex flex-col gap-6">
            {/* Price range */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-normal text-primary">
                  Max price per night
                </label>
                <span className="text-sm text-secondary font-normal">
                  ${maxPrice === MAX_PRICE ? "Any" : maxPrice}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-primary/40 mt-1">
                <span>$0</span>
                <span>$10 000+</span>
              </div>
            </div>

            {/* Min rating */}
            <div>
              <p className="text-sm font-normal text-primary mb-3">
                Minimum rating
              </p>
              <div className="flex gap-2">
                {[0, 4.0, 4.5, 4.7, 4.9].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${minRating === r ? "bg-secondary text-white border-secondary" : "border-primary/20 text-primary hover:border-secondary hover:text-secondary"}`}
                  >
                    {r === 0 ? (
                      "Any"
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-3"
                        >
                          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                        </svg>
                        {r}+
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="text-sm font-normal text-primary mb-3">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {ALL_AMENITIES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleAmenity(key)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${selectedAmenities.includes(key) ? "bg-secondary text-white border-secondary" : "border-primary/20 text-primary hover:border-secondary hover:text-secondary"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-secondary underline w-fit cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && (
        <div className="px-6 py-3 text-xs text-primary/50">
          {filtered.length} venue{filtered.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-primary/40">
          <svg
            className="animate-spin size-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm">Loading venues...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-primary/60">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setSearch(search)}
            className="text-secondary underline text-sm cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Venues grid */}
      {!loading && !error && (
        <section className="px-6 pb-24">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-primary/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="size-14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p className="text-sm">No venues match your search</p>
              <button
                onClick={() => {
                  setSearch("");
                  clearFilters();
                }}
                className="text-secondary underline text-sm cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((venue) => (
                <Link
                  key={venue.id}
                  to={`/venues/${venue.id}`}
                  className="group rounded-2xl border border-secondary overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={venue.media[0]?.url ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"}
                      alt={venue.media[0]?.alt ?? venue.name}
                      className="w-full h-32 md:h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Rating badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-secondary font-normal">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-3"
                      >
                        <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                      </svg>
                      {venue.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-normal text-sm text-primary truncate">
                      {venue.name}
                    </p>
                    <p className="text-xs text-primary/60 mt-0.5">
                      ${venue.price}
                      <span className="font-thin">/night</span>
                    </p>
                    {/* Amenity chips from meta */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {ALL_AMENITIES.filter(({ key }) => venue.meta[key])
                        .slice(0, 2)
                        .map(({ key, label }) => (
                          <span
                            key={key}
                            className="text-xs bg-primary/5 text-primary/60 rounded-full px-2 py-0.5"
                          >
                            {label}
                          </span>
                        ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
