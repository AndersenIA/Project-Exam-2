import logo from "../assets/holidazeLogo.png";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <main className="px-8 h-screen flex flex-col pt-15 font-kulim md:max-w-100 mx-auto">
      <img className="w-19 pb-10" src={logo} alt="" />
      <h1 className="text-2xl font-thin text-primary pb-10">
        Create your account
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
        <label htmlFor="confirmpassword">Confirm Password</label>
        <input
          className="border border-primary rounded-md py-2 px-1 mb-5 placeholder:font-extralight placeholder:italic"
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
        />
        <div className="flex gap-5 pl-1 pb-5">
          <input type="checkbox" name="manager" id="manager" />
          <label htmlFor="manager">Are you a venue manager?</label>
        </div>

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
          className="mt-5 px-1 py-2 text-2xl bg-primary text-white rounded-md shadow-md"
        >
          Register
        </button>
      </form>
    </main>
  );
}
