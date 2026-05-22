import { useState } from "react";
import logo from "../assets/holidazeLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login?_holidaze=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.errors?.[0]?.message ?? "Login failed. Check your credentials.");
        return;
      }
      const { name, email: userEmail, avatar, accessToken, venueManager } = json.data;
      login({ name, email: userEmail, avatar, accessToken, venueManager: venueManager ?? false });
      navigate("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-8 h-screen flex flex-col pt-15 font-kulim md:max-w-100 mx-auto">
      <img className="w-19 pb-10" src={logo} alt="" />
      <h1 className="text-2xl font-thin text-primary pb-10">
        Log into your account
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col justify-around text-primary">
        <label className="pl-1" htmlFor="email">
          Email
        </label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-5 placeholder:font-extralight placeholder:italic"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-5 placeholder:font-extralight placeholder:italic"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <div>
          <p className="font-thin">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-secondary">
              Sign up!
            </Link>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 px-1 py-2 text-2xl bg-secondary text-white rounded-md shadow-lg disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
