import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Integration() {
  const [activeTab, setActiveTab] = useState('constellation');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/notebooks');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.notebooks || []);
          
          if (data.notebooks && data.notebooks.length > 0) {
            setSelectedCategory(data.notebooks[0].id);
          }
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch entries when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/notebooks/${selectedCategory}`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || []);
        } else {
          setError('Failed to fetch entries');
        }
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError('Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedCategory]);

  // Function to handle sending an entry to the constellation viewer
  const addToConstellation = async (entry) => {
    try {
      // Get the full content of the entry
      const response = await fetch(`http://localhost:3001/api/notebooks/${selectedCategory}/${entry.id}`);
      if (!response.ok) throw new Error('Failed to fetch entry content');
      
      const data = await response.json();
      
      // Format the entry for the constellation viewer
      const wikiEntry = {
        title: entry.title,
        content: data.content,
        category: selectedCategory,
        timestamp: new Date().toISOString()
      };
      
      // Send the entry to the constellation viewer API
      const addResponse = await fetch('http://localhost:3003/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(wikiEntry)
      });
      
      if (addResponse.ok) {
        alert(`Added "${entry.title}" to the constellation viewer!`);
      } else {
        alert('Failed to add entry to constellation viewer.');
      }
    } catch (err) {
      console.error('Error adding to constellation:', err);
      alert('Error adding to constellation: ' + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold mb-4">Content Integration</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect and manage content across different visualization tools.
          </p>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('constellation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'constellation'
                    ? 'border-ps2-blue text-ps2-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Constellation Viewer Integration
              </button>
              <button
                onClick={() => setActiveTab('visualization')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'visualization'
                    ? 'border-ps2-blue text-ps2-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                3D Visualization Settings
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-ps2-blue text-ps2-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Category Management
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          {activeTab === 'constellation' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Add Content to Constellation</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Use this tool to send notebook entries to the Constellation Viewer for 3D visualization.
                  Added entries will appear as points in the constellation that can be explored in 3D space.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <h3 className="text-lg font-medium mb-3">Select Category</h3>
                    {loading && !selectedCategory ? (
                      <div className="py-3">Loading categories...</div>
                    ) : error ? (
                      <div className="py-3 text-red-500">{error}</div>
                    ) : (
                      <div className="space-y-3">
                        <select
                          className="input w-full"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name} ({category.entryCount} entries)
                            </option>
                          ))}
                        </select>
                        <div>
                          <a
                            href="http://localhost:8090"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary inline-block text-center"
                          >
                            Open Constellation Viewer
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="text-lg font-medium mb-3">Available Entries</h3>
                    {loading && selectedCategory ? (
                      <div className="py-3">Loading entries...</div>
                    ) : error ? (
                      <div className="py-3 text-red-500">{error}</div>
                    ) : entries.length === 0 ? (
                      <div className="py-3 text-gray-500">No entries found in this category.</div>
                    ) : (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                          {entries.map((entry) => (
                            <li key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{entry.title}</h4>
                                  <p className="text-sm text-gray-500">
                                    Last modified: {new Date(entry.lastModified).toLocaleDateString()}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => addToConstellation(entry)}
                                  className="btn-secondary text-sm"
                                >
                                  Add to Constellation
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'visualization' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">3D Visualization Settings</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Configure performance settings for the 3D visualization to reduce "jank" and improve the experience.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Performance Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="reduce-stars"
                          className="h-4 w-4 text-ps2-blue rounded border-gray-300"
                          defaultChecked
                        />
                        <label htmlFor="reduce-stars" className="ml-2 block text-sm">
                          Reduce star count for better performance
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="disable-twinkling"
                          className="h-4 w-4 text-ps2-blue rounded border-gray-300"
                          defaultChecked
                        />
                        <label htmlFor="disable-twinkling" className="ml-2 block text-sm">
                          Disable star twinkling effect
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="simple-materials"
                          className="h-4 w-4 text-ps2-blue rounded border-gray-300"
                          defaultChecked
                        />
                        <label htmlFor="simple-materials" className="ml-2 block text-sm">
                          Use simple materials instead of reflective ones
                        </label>
                      </div>
                      
                      <div>
                        <label htmlFor="shadow-quality" className="block text-sm font-medium mb-1">
                          Shadow Quality
                        </label>
                        <select
                          id="shadow-quality"
                          className="input w-full max-w-xs"
                          defaultValue="low"
                        >
                          <option value="off">Off (Best Performance)</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High (Worst Performance)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-3">Apply Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      These settings will be applied the next time you open the 3D visualization.
                    </p>
                    <div className="flex space-x-4">
                      <button className="btn-primary">Save Settings</button>
                      <a
                        href="http://localhost:8081"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        Open 3D Visualization
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Category Management</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Manage content categories and apply tags to improve discoverability across all visualization tools.
                </p>
                
                <div className="space-y-6">
                  {loading ? (
                    <div className="py-3">Loading categories...</div>
                  ) : error ? (
                    <div className="py-3 text-red-500">{error}</div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {categories.map((category) => (
                          <tr key={category.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">{category.name}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm">{category.entryCount}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {category.id === 'noxii-wiki' && (
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">game-design</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">sci-fi</span>
                                  </>
                                )}
                                {category.id === 'on-command-wiki' && (
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">game-design</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">narrative</span>
                                  </>
                                )}
                                {category.id === 'autumn-wiki' && (
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">game-design</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">seasonal</span>
                                  </>
                                )}
                                {category.id === 'reference-wiki' && (
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">reference</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">documentation</span>
                                  </>
                                )}
                                <button className="text-xs text-ps2-blue">+ Add</button>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button className="text-ps2-blue hover:text-ps2-light-blue mr-2">Edit</button>
                              <button className="text-ps2-blue hover:text-ps2-light-blue">Sync</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}