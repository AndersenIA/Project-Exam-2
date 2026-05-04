import { useEffect, useRef, useState } from "react";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
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
              <a
                href="/home"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 hover:text-secondary"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/venues"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 hover:text-secondary"
              >
                All venues
              </a>
            </li>
            <li>
              <a
                href="/bookings"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 hover:text-secondary"
              >
                Your bookings
              </a>
            </li>
            <li className="px-4 py-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-secondary"
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
                className="w-full border-b border-secondary px-2 py-1 text-sm bg-transparent placeholder-primary/55 focus:outline-none placeholder:font-extralight placeholder:italic"
              />
            </li>
          </div>
          <li>
            <a
              href="/register"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-secondary"
            >
              Register / Log in
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
