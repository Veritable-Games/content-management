import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function NotebookExplorer() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [notebookContents, setNotebookContents] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  // Mock data for demonstration
  // This would eventually come from an API endpoint
  const notebookCategories = [
    {
      id: 'all-of-it',
      name: 'All of it Anything Everything At Once',
      description: 'General project notes and miscellaneous content',
      path: 'All of it Anything Everything At Once',
      entryCount: 107
    },
    {
      id: 'llm-confusion',
      name: 'LLM Confusion',
      description: 'Notes related to LLM research and implementation',
      path: 'LLM-confusion',
      entryCount: 4
    },
    {
      id: 'autumn-wiki',
      name: 'Autumn Wiki Pages',
      description: 'Wiki documentation for Project Autumn',
      path: 'autumn-wiki-pages',
      entryCount: 2
    },
    {
      id: 'dodec-wiki',
      name: 'Dodec Wiki Pages',
      description: 'Wiki documentation for Project Dodec',
      path: 'dodec-wiki-pages',
      entryCount: 1
    },
    {
      id: 'noxii-wiki',
      name: 'Noxii Wiki Pages',
      description: 'Wiki documentation for Project Noxii',
      path: 'noxii-wiki-pages',
      entryCount: 8
    },
    {
      id: 'on-command-wiki',
      name: 'On Command Wiki Pages',
      description: 'Wiki documentation for Project On Command',
      path: 'on-command-wiki-pages',
      entryCount: 10
    },
    {
      id: 'reference-wiki',
      name: 'Reference Wiki Pages',
      description: 'Reference materials and documentation',
      path: 'reference-wiki-pages',
      entryCount: 9
    }
  ];

  useEffect(() => {
    // Fetch notebooks from the API
    const fetchNotebooks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/notebooks');
        const data = await response.json();
        
        if (data.notebooks && Array.isArray(data.notebooks)) {
          setNotebooks(data.notebooks);
        } else {
          // Fallback to mock data if API doesn't return expected format
          setNotebooks(notebookCategories);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notebooks:', err);
        // Fallback to mock data on error
        setNotebooks(notebookCategories);
        setError('Failed to load notebooks from API. Using cached data.');
        setLoading(false);
      }
    };

    fetchNotebooks();
  }, []);

  const handleNotebookClick = async (notebook) => {
    setCurrentNotebook(notebook);
    setContentLoading(true);
    
    try {
      // Fetch notebook entries from the API
      const response = await fetch(`http://localhost:3001/api/notebooks/${notebook.id}`);
      const data = await response.json();
      
      if (data.entries && Array.isArray(data.entries)) {
        setNotebookContents(data.entries);
      } else {
        // Fallback to mock data if API doesn't return expected format
        const mockEntries = Array.from({ length: notebook.entryCount }, (_, i) => ({
          id: `entry-${i}`,
          title: `Entry ${i + 1}`,
          path: `/${notebook.path}/entry-${i + 1}.txt`,
          lastModified: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        }));
        
        setNotebookContents(mockEntries);
      }
    } catch (err) {
      console.error('Error fetching notebook entries:', err);
      // Fallback to mock data on error
      const mockEntries = Array.from({ length: notebook.entryCount }, (_, i) => ({
        id: `entry-${i}`,
        title: `Entry ${i + 1}`,
        path: `/${notebook.path}/entry-${i + 1}.txt`,
        lastModified: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      }));
      
      setNotebookContents(mockEntries);
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold mb-4">Notebook Explorer</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Browse and manage project notebooks and documentation.
          </p>
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Notebook Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
                <div className="bg-ps2-blue text-white px-4 py-3">
                  <h2 className="font-semibold">Notebook Categories</h2>
                </div>
                <div className="p-2">
                  {loading ? (
                    <div className="text-center py-4">
                      <svg className="animate-spin h-5 w-5 mx-auto text-ps2-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading categories...</p>
                    </div>
                  ) : error ? (
                    <div className="p-3 text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  ) : (
                    <nav className="space-y-1">
                      {notebooks.map((notebook) => (
                        <button
                          key={notebook.id}
                          onClick={() => handleNotebookClick(notebook)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            currentNotebook?.id === notebook.id
                              ? 'bg-ps2-blue text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{notebook.name}</span>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                              {notebook.entryCount}
                            </span>
                          </div>
                        </button>
                      ))}
                    </nav>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - Notebook Entries */}
          <div className="lg:col-span-3">
            {currentNotebook ? (
              <div className="bg-white dark:bg-gray-800 rounded-md shadow">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{currentNotebook.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentNotebook.description}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/notebooks/${currentNotebook.id}/new`)}
                    className="btn-primary"
                  >
                    Create Entry
                  </button>
                </div>
                
                {contentLoading ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-8 w-8 mx-auto text-ps2-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notebook contents...</p>
                  </div>
                ) : notebookContents.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <p className="text-gray-500 dark:text-gray-400">No entries found in this notebook.</p>
                    <button 
                      onClick={() => router.push(`/notebooks/${currentNotebook.id}/new`)}
                      className="mt-4 btn-secondary"
                    >
                      Add New Entry
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notebookContents.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">{entry.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Last modified: {new Date(entry.lastModified).toLocaleDateString()} at {new Date(entry.lastModified).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link 
                              href={`/notebooks/${currentNotebook.id}/${entry.id}`}
                              className="text-ps2-blue hover:text-ps2-light-blue"
                            >
                              View
                            </Link>
                            <button 
                              onClick={() => router.push(`/editor?file=${entry.id}&category=${currentNotebook.id}`)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-md shadow p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Select a Notebook</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Choose a notebook category from the sidebar to view its contents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}