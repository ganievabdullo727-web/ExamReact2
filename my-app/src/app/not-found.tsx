import React from 'react'

const NotFound = () => {
 return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-7xl font-bold text-violet-600">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
        Page not found
      </h2>

      <p className="mt-3 text-gray-500">
        The page you are looking for does not exist.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-700"
      >
        Back to Home
      </Link>
    </main>
  );
}

export default NotFound