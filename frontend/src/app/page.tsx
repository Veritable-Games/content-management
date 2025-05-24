export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Welcome to Veritable Games
        </h1>
        <p className="text-xl mb-8">
          Creating unforgettable gaming experiences
        </p>
        <div className="space-x-4">
          <a
            href="/projects"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Our Games
          </a>
          <a
            href="/about"
            className="inline-block bg-neutral-200 dark:bg-neutral-800 px-6 py-3 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>
    </div>
  )
}
