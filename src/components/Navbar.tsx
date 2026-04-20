export function Navbar() {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">My React App</h1>
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="hover:text-gray-400">
              Home
            </a>
          </li>
          <li>
            <a href="/register" className="hover:text-gray-400">
              Register
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
