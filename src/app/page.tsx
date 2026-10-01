import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-gray-200 px-8 py-5">
        <Link
          href="/"
          className="text-xl font-semibold text-gray-900"
        >
          Interior
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6">
        <div className="max-w-3xl text-center">

          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray-500">
            Interior Design Platform
          </p>

          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 md:text-6xl">
            Find the right designer
            <br />
            for your space.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-500">
            Discover interior designers, explore their work,
            and find the right professional for your next project.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Log In
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}