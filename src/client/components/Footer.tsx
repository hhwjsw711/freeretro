import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="text-cf-text-muted flex flex-wrap items-center justify-center gap-3 px-6 py-6 text-sm">
      <Link to="/about" className="hover:text-cf-orange transition-colors">
        这是什么？
      </Link>
    </footer>
  );
}
