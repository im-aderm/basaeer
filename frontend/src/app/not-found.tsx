import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-amber-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}
