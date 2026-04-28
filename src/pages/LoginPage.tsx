import logo from "../assets/holidazeLogo.png";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <main className="px-8 h-screen flex flex-col pt-15 font-kulim">
      <img className="w-19 pb-10" src={logo} alt="" />
      <h1 className="text-2xl font-thin text-primary pb-10">
        Log into your account
      </h1>
      <form
        action="register"
        method="post"
        className="flex flex-col justify-around text-primary"
      >
        <label className="pl-1" htmlFor="email">
          Email
        </label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-5 placeholder:font-extralight placeholder:italic"
          type="email"
          name="email"
          placeholder="Email"
        />
        <label htmlFor="password">Password</label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-5 placeholder:font-extralight placeholder:italic"
          type="password"
          name="password"
          placeholder="Password"
        />

        <div>
          <p className="font-thin">
            Dont have an account yet?{" "}
            <Link to="/register" className="text-secondary">
              Sign up!
            </Link>
          </p>
        </div>

        <button
          type="submit"
          className="mt-5 px-1 py-2 text-2xl bg-primary text-white rounded-md shadow-lg"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
