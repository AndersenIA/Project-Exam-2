import { useState } from "react";
import logo from "../assets/holidazeLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [venueManager, setVenueManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Register
      const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, venueManager }),
      });
      const registerJson = await registerRes.json();
      if (!registerRes.ok) {
        setError(registerJson.errors?.[0]?.message ?? "Registration failed.");
        return;
      }

      // Auto-login after successful registration
      const loginRes = await fetch(`${BASE_URL}/auth/login?_holidaze=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginJson = await loginRes.json();
      if (loginRes.ok) {
        const { name: userName, email: userEmail, avatar, accessToken, venueManager: vm } = loginJson.data;
        login({ name: userName, email: userEmail, avatar, accessToken, venueManager: vm ?? venueManager });
      }

      navigate("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-8 min-h-screen flex flex-col pt-15 pb-10 font-kulim md:max-w-100 mx-auto">
      <img className="w-19 pb-10" src={logo} alt="" />
      <h1 className="text-2xl font-thin text-primary pb-10">
        Create your account
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col text-primary">
        <label className="pl-1 mb-1" htmlFor="name">
          Username
        </label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-1 placeholder:font-extralight placeholder:italic"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my_username"
          required
        />
        <p className="text-xs text-primary/50 mb-4 pl-1">
          Only letters, numbers and underscore (_)
        </p>

        <label className="pl-1 mb-1" htmlFor="email">
          Email
        </label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-1 placeholder:font-extralight placeholder:italic"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="first.last@stud.noroff.no"
          required
        />
        <p className="text-xs text-primary/50 mb-4 pl-1">
          Must be a @stud.noroff.no email address
        </p>

        <label className="pl-1 mb-1" htmlFor="password">
          Password
        </label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-4 placeholder:font-extralight placeholder:italic"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
        />

        <label className="pl-1 mb-1" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-4 placeholder:font-extralight placeholder:italic"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          required
        />

        <div className="flex gap-3 items-center pl-1 pb-5">
          <input
            type="checkbox"
            id="venueManager"
            checked={venueManager}
            onChange={(e) => setVenueManager(e.target.checked)}
            className="w-4 h-4 accent-secondary cursor-pointer"
          />
          <label htmlFor="venueManager" className="cursor-pointer">
            I am a venue manager
          </label>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <div>
          <p className="font-thin">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary">
              Log in
            </Link>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 px-1 py-2 text-2xl bg-primary text-white rounded-md shadow-md disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </main>
  );
}
