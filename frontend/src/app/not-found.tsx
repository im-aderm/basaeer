import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-primary font-heading">?</span>
        </div>
        <h1 className="text-7xl font-extrabold text-primary font-heading mb-2">404</h1>
        <h2 className="text-2xl font-bold text-text-primary font-heading mb-3">Page Not Found</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-light text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
