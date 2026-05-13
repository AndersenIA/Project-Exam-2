import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getVenues, type Venue } from "../api/venues";

export function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [topVenues, setTopVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then((venues) => {
        const top4 = [...venues].sort((a, b) => b.rating - a.rating).slice(0, 4);
        setTopVenues(top4);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (search.trim()) navigate(`/venues?search=${encodeURIComponent(search.trim())}`);
    else navigate("/venues");
  }

  return (
    <main className="flex flex-col mt-20 font-kulim font-thin">
      <section
        className="bg-cover bg-center min-h-80 md:min-h-150 flex items-end border-b-2 border-primary mb-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="w-full px-8 pb-8 md:pb-18 bg-linear-to-t from-black/80 to-transparent pt-5">
          <div className="max-w-150">
            <h1 className="text-4xl md:text-5xl text-white drop-shadow-lg pb-4">
              Welcome to Holidaze!
            </h1>
            <h2 className="text-2xl md:text-3xl text-white drop-shadow-md mt-1">
              Plan your next vacation
              <br /> View the{" "}
              <Link className="text-secondary md:text-5xl" to="/venues">
                venues
              </Link>
            </h2>
            <div className="pt-4">
              <p className="text-white drop-shadow-md md:text-xl">
                Where do you want to travel to?
              </p>
              <form onSubmit={handleSearch} className="flex items-center pt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-white"
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
                  placeholder="Search..."
                  className="w-full border-b border-white px-2 py-1 text-sm bg-transparent text-white placeholder-white/70 max-w-70 focus:outline-none placeholder:font-extralight placeholder:italic"
                />
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="p-8 pb-50 flex flex-col gap-6">
        <h2 className="text-2xl text-center mb-6 text-primary">
          Popular venues
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-primary/40">
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-primary">
            {topVenues.map((venue) => (
              <Link
                key={venue.id}
                to={`/venues/${venue.id}`}
                className="rounded-2xl border-2 border-secondary overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={venue.media[0]?.url ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"}
                  alt={venue.media[0]?.alt ?? venue.name}
                  className="w-full h-20 md:h-40 object-cover"
                />
                <div className="flex justify-between items-center px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-normal text-sm truncate">{venue.name}</p>
                    <p className="text-sm font-thin">${venue.price}/night</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary shrink-0 ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                    </svg>
                    <span className="text-sm">{venue.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/venues"
          className="border border-secondary rounded-lg mt-4 w-fit mx-auto px-4 py-2 text-secondary hover:bg-secondary hover:text-white transition-colors"
        >
          View all venues
        </Link>
      </section>
    </main>
  );
}
