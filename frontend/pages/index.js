import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  const [notebookCount, setNotebookCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({});

  // Sample featured project data
  const featuredProjects = [
    {
      id: 'noxii',
      title: 'Noxii',
      description: 'Game Design Documents and concept art for Project Noxii.',
      category: 'noxii-wiki',
      image: '/placeholder-noxii.jpg',
      entryCount: 8
    },
    {
      id: 'on-command',
      title: 'On Command',
      description: 'Game Design Documents and world-building for On Command, a sci-fi adventure.',
      category: 'on-command-wiki', 
      image: '/placeholder-on-command.jpg',
      entryCount: 10
    },
    {
      id: 'autumn',
      title: 'Autumn',
      description: 'Design concepts and narrative elements for Project Autumn.',
      category: 'autumn-wiki',
      image: '/placeholder-autumn.jpg',
      entryCount: 2
    },
    {
      id: 'dodec',
      title: 'Dodec',
      description: 'Character profiles and world-building for the Dodec universe.',
      category: 'dodec-wiki',
      image: '/placeholder-dodec.jpg',
      entryCount: 1
    }
  ];

  useEffect(() => {
    // Fetch notebook data from the API
    const fetchNotebooks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/notebooks');
        const data = await response.json();
        
        if (data.notebooks && Array.isArray(data.notebooks)) {
          const totalEntries = data.notebooks.reduce((total, notebook) => total + notebook.entryCount, 0);
          setNotebookCount(totalEntries);
          setCategoriesCount(data.notebooks.length);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notebooks:', err);
        // Set some default values if the API fails
        setNotebookCount(141);
        setCategoriesCount(7);
        setLoading(false);
      }
    };

    // Fetch system status
    const fetchStatus = async () => {
      try {
        // Check status of all connected services
        const services = [
          { name: 'Content API', url: 'http://localhost:3001/api/debug/env' },
          { name: '3D Visualization', url: 'http://localhost:8081' },
          { name: 'Constellation Viewer', url: 'http://localhost:8090' },
          { name: 'Constellation API', url: 'http://localhost:3003/pages' },
        ];

        const statuses = {};

        for (const service of services) {
          try {
            const response = await fetch(service.url, { 
              method: 'GET',
              mode: 'no-cors' // This allows us to at least check if the service is up
            });
            statuses[service.name] = 'Online';
          } catch (err) {
            console.error(`Error checking ${service.name}:`, err);
            statuses[service.name] = 'Offline';
          }
        }

        setSystemStatus(statuses);
      } catch (err) {
        console.error('Error checking system status:', err);
      }
    };

    fetchNotebooks();
    fetchStatus();
  }, []);

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-ps2-blue to-ps2-dark-blue rounded-xl overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] bg-repeat"></div>
          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 md:py-20 text-white max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Veritable Games Wiki</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/80">
              Explore game design documents, world-building, and creative concepts across multiple projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/notebooks" className="btn-primary text-center px-6 py-3 text-lg">
                Browse Notebooks
              </Link>
              <a 
                href="http://localhost:8090" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary text-center px-6 py-3 text-lg"
              >
                3D Constellation View
              </a>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <h3 className="text-lg font-medium mb-2">Total Notebook Entries</h3>
              <p className="text-4xl font-bold text-ps2-blue">{loading ? '...' : notebookCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Across all projects and categories</p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-medium mb-2">Notebook Categories</h3>
              <p className="text-4xl font-bold text-ps2-blue">{loading ? '...' : categoriesCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Different collections of content</p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-medium mb-2">System Status</h3>
              <p className={`text-xl font-bold ${
                Object.values(systemStatus).every(status => status === 'Online')
                  ? 'text-green-500'
                  : 'text-yellow-500'
              }`}>
                {Object.values(systemStatus).every(status => status === 'Online')
                  ? 'All Systems Operational'
                  : 'Partial System Outage'
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {Object.values(systemStatus).filter(status => status === 'Online').length}/{Object.keys(systemStatus).length} services online
              </p>
            </div>
          </div>
        </section>
        
        {/* Featured Projects */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <Link href="/notebooks" className="text-ps2-blue hover:text-ps2-light-blue font-medium">
              View All Projects →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((project) => (
              <Link 
                key={project.id} 
                href={`/notebooks?category=${project.category}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="h-48 bg-gradient-to-br from-ps2-light-blue to-ps2-dark-blue flex items-center justify-center">
                  <span className="text-6xl text-white/30 font-bold">{project.title.charAt(0)}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium group-hover:text-ps2-blue transition-colors">{project.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                      {project.entryCount} entries
                    </span>
                    <span className="text-ps2-blue text-sm">Explore</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Visualization Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">Interactive Visualizations</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Explore our wiki content through interactive visualizations. See connections between 
              different entries and navigate through the content in a new way.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">3D Constellation View</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Visualize wiki entries as a 3D constellation. Interact with entries in 3D space and 
                    explore relationships between different concepts.
                  </p>
                  <a 
                    href="http://localhost:8090" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary inline-block text-center"
                  >
                    Open Constellation View
                  </a>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">3D Environment</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Explore a 3D visualization with interactive dodecahedron in a starfield environment. 
                    Use WASD keys and mouse to navigate the scene.
                  </p>
                  <a 
                    href="http://localhost:8081" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary inline-block text-center"
                  >
                    Open 3D Visualization
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* System Status */}
        <section id="system-status">
          <h2 className="text-2xl font-bold mb-4">System Status</h2>
          <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(systemStatus).map(([service, status]) => (
                  <tr key={service} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status === 'Online' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {service === 'Content API' ? 'Backend API for notebook content' :
                         service === '3D Visualization' ? '3D environment visualization' :
                         service === 'Constellation Viewer' ? 'Interactive wiki constellation' :
                         service === 'Constellation API' ? 'API for constellation data' : 'System service'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={
                          service === 'Content API' ? 'http://localhost:3001' :
                          service === '3D Visualization' ? 'http://localhost:8081' :
                          service === 'Constellation Viewer' ? 'http://localhost:8090' :
                          service === 'Constellation API' ? 'http://localhost:3003' : '#'
                        }
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-ps2-blue hover:text-ps2-light-blue"
                      >
                        Visit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}