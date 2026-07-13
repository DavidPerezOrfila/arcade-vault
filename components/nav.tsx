import Link from "next/link";

// ponytail: esqueleto mínimo que compila y navega; Step 4 añade auth,
// contador de créditos y menú hamburguesa responsive (usePathname + estado).
export default function Nav() {
  return (
    <nav className="av-nav">
      <Link href="/" className="logo">
        <span className="logo-mark" aria-hidden />
        <span className="logo-text">ARCADE VAULT</span>
      </Link>
      <div className="links">
        <Link href="/" className="active">
          BIBLIOTECA
        </Link>
        <Link href="/salon">SALÓN</Link>
      </div>
      <div className="spacer" />
    </nav>
  );
}
