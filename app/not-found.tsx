import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-primary-dark">404</h1>
      <p className="text-dark/60">This page could not be found.</p>
      <Link href="/" className="text-primary hover:underline">
        Go home
      </Link>
    </div>
  );
}
