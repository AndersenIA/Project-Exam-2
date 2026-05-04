import { mockVenues, mockProfile } from "../data/mockData";

export function Home() {
  return (
    <main className="flex flex-col mt-30 font-kulim font-thin">
      <section
        className="bg-cover bg-center min-h-80 flex items-end border-b-2 border-primary"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566371486490-560ded23b5e4?fm=jpg&q=60&w=3000&auto=format&fit=crop')",
        }}
      >
        <div className="w-full px-8 pb-8 bg-linear-to-t from-black/60 to-transparent pt-20">
          <div className="max-w-100">
            <h1 className="text-3xl text-white drop-shadow-lg">Welcome {mockProfile.username}!</h1>
            <h2 className="text-lg text-white drop-shadow-md mt-1">
              Plan your next vacation
              <br /> View the{" "}
              <a className="text-secondary" href="/venues">
                venues
              </a>
            </h2>
            <div className="pt-4">
              <p className="text-white drop-shadow-md">Where do you want to travel to?</p>
              <div className="flex items-center pt-4">
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
                  placeholder="Search..."
                  className="w-full border-b border-white px-2 py-1 text-sm bg-transparent text-white placeholder-white/70 max-w-70 focus:outline-none placeholder:font-extralight placeholder:italic"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl text-center mb-6">Popular venues</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockVenues.map((venue) => (
            <a
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="rounded-2xl border-2 border-secondary overflow-hidden shadow-md"
            >
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-40 object-cover"
              />
              <div className="flex justify-between items-center px-3 py-2">
                <div>
                  <p className="font-normal">{venue.name}</p>
                  <p className="text-sm">${venue.price}/night</p>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                  </svg>
                  <span className="text-sm">{venue.rating}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
