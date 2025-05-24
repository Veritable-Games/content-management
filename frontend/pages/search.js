import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'noxii-wiki', name: 'Noxii' },
    { id: 'on-command-wiki', name: 'On Command' },
    { id: 'autumn-wiki', name: 'Autumn' },
    { id: 'dodec-wiki', name: 'Dodec' },
    { id: 'reference-wiki', name: 'Reference' },
    { id: 'llm-confusion', name: 'LLM Confusion' },
  ];

  // Function to perform search
  const performSearch = async (query, category = 'all') => {
    if (!query) return;
    
    setLoading(true);
    
    try {
      // Try the real API first
      try {
        const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}&category=${category}`);
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results);
          setResultsCount(data.count);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.error('API search failed, falling back to mock data:', apiError);
      }
      
      // Fall back to mock results if the API fails
      setTimeout(() => {
        const mockResults = [];
        
        // Create some realistic mock results based on the query
        if (query.toLowerCase().includes('noxii') || selectedCategory === 'noxii-wiki') {
          mockResults.push({
            id: 'noxii-gdd-01',
            title: 'Noxii GDD - 01-28-2019',
            category: 'noxii-wiki',
            path: '/notebooks/noxii-wiki/noxii-gdd-01-28-2019',
            excerpt: `...The core gameplay loop of Noxii involves exploration, resource gathering, and survival. Players must navigate a hostile world where ${query} is a key element to progression...`,
            lastModified: '2023-07-15T10:30:00Z'
          });
          mockResults.push({
            id: 'noxii-pitch',
            title: 'Noxii - Pitch',
            category: 'noxii-wiki',
            path: '/notebooks/noxii-wiki/noxii-pitch',
            excerpt: `...The game world of ${query} features a unique alien environment with distinct biomes, each presenting their own challenges and opportunities...`,
            lastModified: '2023-05-23T14:45:00Z'
          });
        }
        
        if (query.toLowerCase().includes('command') || selectedCategory === 'on-command-wiki') {
          mockResults.push({
            id: 'on-command-gdd',
            title: 'On Command GDD',
            category: 'on-command-wiki',
            path: '/notebooks/on-command-wiki/on-command-gdd',
            excerpt: `...The command system allows players to issue various orders to NPCs. ${query} is used to control squad movement, combat tactics, and special abilities...`,
            lastModified: '2023-08-10T09:15:00Z'
          });
        }
        
        if (query.toLowerCase().includes('suit') || (selectedCategory === 'all' || selectedCategory === 'on-command-wiki')) {
          mockResults.push({
            id: 'hse-suit',
            title: 'HSE Suit',
            category: 'on-command-wiki',
            path: '/notebooks/on-command-wiki/hse-suit',
            excerpt: `...The Hazardous Environment Suit (HSE) provides protection against various environmental hazards. The ${query} technology incorporates advanced materials to shield the wearer...`,
            lastModified: '2023-06-05T16:20:00Z'
          });
        }
        
        // Generic results for any search
        if (selectedCategory === 'all' || mockResults.length < 3) {
          mockResults.push({
            id: 'random-result-1',
            title: 'Project Documentation',
            category: 'reference-wiki',
            path: '/notebooks/reference-wiki/project-documentation',
            excerpt: `...The development process involves multiple stages where ${query} plays an important role in ensuring quality and consistency across all aspects of the project...`,
            lastModified: '2023-09-01T11:10:00Z'
          });
          mockResults.push({
            id: 'random-result-2',
            title: 'Design Philosophy',
            category: 'reference-wiki',
            path: '/notebooks/reference-wiki/design-philosophy',
            excerpt: `...Our approach to game design emphasizes player agency and immersion. ${query} is considered a fundamental principle that guides our creative decisions...`,
            lastModified: '2023-07-28T08:50:00Z'
          });
        }
        
        // Filter by category if needed
        const filteredResults = selectedCategory === 'all' 
          ? mockResults 
          : mockResults.filter(result => result.category === selectedCategory);
        
        setSearchResults(filteredResults);
        setResultsCount(filteredResults.length);
        setLoading(false);
      }, 800); // Simulate network delay
      
    } catch (err) {
      console.error('Error performing search:', err);
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search query for shareable links
    router.push({
      pathname: '/search',
      query: { q: searchQuery, category: selectedCategory }
    }, undefined, { shallow: true });
    
    performSearch(searchQuery, selectedCategory);
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    performSearch(searchQuery, category);
  };

  // Initial search based on URL parameters
  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      const category = router.query.category || 'all';
      setSelectedCategory(category);
      performSearch(q, category);
    }
  }, [q, router.query.category]);

  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold mb-4">Search Wiki</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Search across all notebook entries to find specific content. Use filters to narrow your results.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="input pl-10 w-full"
                    placeholder="Search for keywords, topics, or phrases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-auto">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    className="input w-full sm:w-48"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 flex items-end">
                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Search Results */}
          <div>
            {q && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">
                  {loading ? 'Searching...' : `Results for "${q}"`}
                </h2>
                {!loading && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {resultsCount} {resultsCount === 1 ? 'result' : 'results'} found
                  </span>
                )}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 mx-auto text-ps2-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Searching wiki content...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={result.path} className="text-lg font-medium text-ps2-blue hover:text-ps2-light-blue">
                        {result.title}
                      </Link>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {categories.find(cat => cat.id === result.category)?.name || result.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {result.excerpt}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Last updated: {new Date(result.lastModified).toLocaleDateString()}</span>
                      <Link href={result.path} className="text-ps2-blue hover:text-ps2-light-blue">
                        View Entry →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : q && !loading ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <svg className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  We couldn't find any matches for "{q}" in the {selectedCategory === 'all' ? 'wiki' : categories.find(cat => cat.id === selectedCategory)?.name}.
                </p>
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Suggestions:</p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Check your spelling</li>
                    <li>Try more general keywords</li>
                    <li>Try different keywords</li>
                    <li>Try searching in all categories</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </Layout>
  );
}