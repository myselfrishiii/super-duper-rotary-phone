import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="header" role="banner">
      <div className="inner">
        <Link href="/" className="brand" aria-label="Home">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <div>
            <strong>Sanatan Wiki</strong>
            <div style={{ fontSize: 12, color: "#6b7280" }}>A small JSON wiki</div>
          </div>
        </Link>

        <nav role="navigation" aria-label="Main navigation">
          <Link href="/articles">Articles</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/search">Search</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
