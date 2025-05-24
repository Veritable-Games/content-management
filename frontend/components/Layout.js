import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Notebook Explorer', href: '/notebooks' },
    { name: 'Visualizations', href: '/visualization' },
    { name: 'Integration', href: '/integration' },
    { name: 'Search', href: '/search' },
    { name: 'System Status', href: '/#system-status' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ps2-blue text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                <path d="M12,2 L5,12 L12,22 L19,12 L12,2 Z M12,8 L9,12 L12,16 L15,12 L12,8 Z" />
              </svg>
              <h1 className="text-xl font-bold">Content Management</h1>
            </Link>
          </div>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex max-w-md flex-1 mx-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full bg-white/10 border-none pl-10 pr-4 py-2 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Search notebooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="ml-2 bg-white/20 text-white px-4 py-2 rounded-md hover:bg-white/30 transition-colors"
            >
              Search
            </button>
          </form>
          
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              item.external ? (
                <a 
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-white/80 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name} ↗
                </a>
              ) : (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`
                    ${router.pathname === item.href ? 'text-white font-medium' : 'text-white/80 hover:text-white'} 
                    transition
                  `}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>
          
          <div className="md:hidden">
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Veritable Games</p>
        </div>
      </footer>
    </div>
  );
}