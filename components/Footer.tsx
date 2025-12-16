export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div>
        <div>© {new Date().getFullYear()} Sanatan Wiki</div>
        <div style={{ marginTop: 6 }} className="meta">Built with Next.js · JSON content</div>
      </div>
    </footer>
  );
}
