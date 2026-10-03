
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#1c1c1a]">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white"
        >
          Interior.
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/85"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/interior-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Hero content */}
        <div className="relative z-10 flex min-h-screen items-end px-6 pb-16 md:px-10 md:pb-20">
          <div className="max-w-4xl text-white">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
              Interior Design Platform
            </p>

            <h1 className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-8xl">
              Find a designer
              <br />
              worth coming home to.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg">
              Discover talented interior designers, explore their work,
              and find the right professional to bring your space to life.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
              >
                Explore Designers →
              </Link>

              <Link
                href="/login"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition duration-300 hover:bg-white/20"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-7 right-6 z-10 hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60 md:flex">
          <span>Explore</span>
          <span className="h-px w-10 bg-white/40" />
        </div>
      </section>

      {/* Introduction */}
      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2 md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-black/45">
                Discover your style
              </p>

              <h2 className="max-w-2xl text-4xl font-medium leading-tight tracking-[-0.03em] md:text-6xl">
                Inspiration for spaces that feel like you.
              </h2>
            </div>

            <p className="max-w-lg text-base leading-7 text-black/55 md:justify-self-end md:text-lg">
              Browse real interior design projects, discover new ideas,
              and connect with professionals who can turn your vision into
              a finished space.
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <div className="group rounded-3xl bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-16 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eee9] text-lg">
              01
            </div>

            <h3 className="text-2xl font-medium">Explore</h3>

            <p className="mt-3 leading-7 text-black/55">
              Discover interior designers and browse their completed projects.
            </p>
          </div>

          <div className="group rounded-3xl bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-16 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eee9] text-lg">
              02
            </div>

            <h3 className="text-2xl font-medium">Save</h3>

            <p className="mt-3 leading-7 text-black/55">
              Keep your favourite projects in one place for future inspiration.
            </p>
          </div>

          <div className="group rounded-3xl bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-16 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eee9] text-lg">
              03
            </div>

            <h3 className="text-2xl font-medium">Connect</h3>

            <p className="mt-3 leading-7 text-black/55">
              Find the right professional for your next interior design project.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#1c1c1a] px-6 py-20 text-white md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/50">
            Start your journey
          </p>

          <h2 className="mx-auto max-w-3xl text-4xl font-medium tracking-[-0.03em] md:text-6xl">
            Your next space starts here.
          </h2>

          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
          >
            Get Started →
          </Link>
        </div>
      </section>
    </main>
  );
}

