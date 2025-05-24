import { Navigation } from '../nav/Navigation'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-neutral-100 dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} Veritable Games. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout