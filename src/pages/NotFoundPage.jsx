import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="muted mt-3 text-sm">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary mt-6">Back to Banko</Link>
    </div>
  );
}
