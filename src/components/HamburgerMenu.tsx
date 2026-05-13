import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    setIsOpen(false);
    if (search.trim()) navigate(`/venues?search=${encodeURIComponent(search.trim())}`);
    else navigate("/venues");
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="font-kulim" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5 cursor-pointer"
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-secondary transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}
        />
        <span
          className={`block w-6 h-0.5 bg-secondary transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block w-6 h-0.5 bg-secondary transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute top-full mt-0.5 right-0 w-48 text-primary border-l-2 border-b-2 border-secondary rounded-bl-2xl shadow-lg flex flex-col justify-between min-h-70 py-2 bg-white">
          <div className="flex flex-col">
            <li>
              <Link
                to="/home"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 hover:text-secondary"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/venues"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 hover:text-secondary"
              >
                All venues
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/bookings"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 hover:text-secondary"
                >
                  Your bookings
                </Link>
              </li>
            )}
            <li className="px-4 py-2">
              <form onSubmit={handleSearch} className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4 text-secondary shrink-0"
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
                  className="w-full border-b border-secondary px-2 py-1 text-sm bg-transparent placeholder-primary/55 focus:outline-none placeholder:font-extralight placeholder:italic"
                />
              </form>
            </li>
          </div>

          {/* Bottom: user info or auth links */}
          <li className="px-4 py-2">
            {user ? (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 hover:text-secondary"
              >
                <img
                  src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt={user.avatar?.alt || user.name}
                  className="w-7 h-7 rounded-full object-cover border border-secondary/30 shrink-0"
                />
                <span className="text-sm font-normal truncate">{user.name}</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-secondary hover:underline text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-secondary hover:underline text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </li>
        </ul>
      )}
    </div>
  );
}
