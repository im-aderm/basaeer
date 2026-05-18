'use client';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <div className="text-center space-y-3 max-w-md">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
