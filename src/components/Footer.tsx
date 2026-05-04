export function Footer() {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className=" text-primary py-4 text-center text-sm border-t-2 border-primary font-kulim">
      <p>&copy; {currentYear} Holidaze - All rights reserved.</p>
    </footer>
  );
}
