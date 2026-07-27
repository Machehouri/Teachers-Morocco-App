export default function Home() {

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HERO */}
      <section className="bg-blue-600 text-white py-28 px-8">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-6xl font-bold leading-tight">
            Find The Best
            <br />
            Private Teachers
            <br />
            In Morocco
          </h1>

          <p className="mt-6 text-xl text-blue-100 max-w-2xl">
            Discover trusted teachers for math, languages,
            programming, science, and more.
          </p>

          <div className="mt-10 flex gap-4">

            <button
              onClick={() => window.location.href = "/teachers"}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100"
            >
              Explore Teachers
            </button>

            <button
              onClick={() => window.location.href = "/signup"}
              className="border border-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500"
            >
              Become a Teacher
            </button>

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="py-24 px-8">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose TeachMe?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-3xl shadow-md">

              <div className="text-5xl mb-5">
                🎓
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Qualified Teachers
              </h3>

              <p className="text-gray-600">
                Find experienced teachers for every subject.
              </p>

            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md">

              <div className="text-5xl mb-5">
                ⭐
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Verified Reviews
              </h3>

              <p className="text-gray-600">
                Read real student feedback before booking.
              </p>

            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md">

              <div className="text-5xl mb-5">
                📍
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Teachers Everywhere
              </h3>

              <p className="text-gray-600">
                Discover teachers across all Moroccan cities.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-24 px-8">

        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-5xl font-bold">
            Ready To Start Learning?
          </h2>

          <p className="mt-6 text-xl text-gray-300">
            Join students and teachers across Morocco.
          </p>

          <button
            onClick={() => window.location.href = "/teachers"}
            className="mt-10 bg-blue-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-blue-500"
          >
            Browse Teachers
          </button>

        </div>

      </section>

    </div>
  );
}