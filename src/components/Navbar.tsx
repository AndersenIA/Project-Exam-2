import logo_img from "../assets/holidazeLogo.png";
import { HamburgerMenu } from "./HamburgerMenu";

export function Navbar() {
  return (
    <nav className="fixed z-50 bg-white w-screen text-white py-4 px-8 border-b-2 border-primary font-kulim">
      <div className="container mx-auto flex justify-between items-center">
        <img className="w-16" src={logo_img} alt="Holidaze Logo" />
        <HamburgerMenu />
      </div>
    </nav>
  );
}
