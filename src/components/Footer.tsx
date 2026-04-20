export function Footer() {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-4 text-center text-sm">
      <p>&copy; {currentYear} Holidaze - All rights reserved.</p>
    </footer>
  );
}
