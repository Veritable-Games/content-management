import { useState } from 'react';
import Layout from '../components/Layout';

export default function Visualization() {
  const [visualizationType, setVisualizationType] = useState('constellation'); // 'constellation' or '3d-environment'
  
  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold mb-4">Interactive Visualizations</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Explore our wiki content through interactive 3D visualizations. Switch between different views to experience
            the content in unique ways.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  visualizationType === 'constellation'
                    ? 'border-b-2 border-ps2-blue text-ps2-blue'
                    : 'text-gray-600 dark:text-gray-400 hover:text-ps2-blue dark:hover:text-ps2-light-blue'
                }`}
                onClick={() => setVisualizationType('constellation')}
              >
                Constellation View
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  visualizationType === '3d-environment'
                    ? 'border-b-2 border-ps2-blue text-ps2-blue'
                    : 'text-gray-600 dark:text-gray-400 hover:text-ps2-blue dark:hover:text-ps2-light-blue'
                }`}
                onClick={() => setVisualizationType('3d-environment')}
              >
                3D Environment
              </button>
            </div>
            
            <div className="p-4">
              {visualizationType === 'constellation' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Constellation View</h2>
                    <a 
                      href="http://localhost:8090" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-ps2-blue hover:text-ps2-light-blue"
                    >
                      Open in full screen ↗
                    </a>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                    <p className="font-medium mb-2">Controls:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                      <li>Click and drag to rotate the view</li>
                      <li>Right-click and drag to orbit around the center</li>
                      <li>Scroll to zoom in and out</li>
                      <li>Click on a constellation point to view its content</li>
                    </ul>
                  </div>
                  
                  <div className="relative w-full" style={{ paddingTop: '75%' /* 4:3 aspect ratio */ }}>
                    <iframe 
                      src="http://localhost:8090" 
                      className="absolute inset-0 w-full h-full border-0 rounded-md"
                      title="Constellation Visualization"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">3D Environment</h2>
                    <a 
                      href="http://localhost:8081" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-ps2-blue hover:text-ps2-light-blue"
                    >
                      Open in full screen ↗
                    </a>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                    <p className="font-medium mb-2">Controls:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                      <li>Use WASD keys to move around</li>
                      <li>Use arrow keys to look around</li>
                      <li>Mouse click and drag to rotate camera</li>
                      <li>Scroll to adjust movement speed</li>
                    </ul>
                  </div>
                  
                  <div className="relative w-full" style={{ paddingTop: '75%' /* 4:3 aspect ratio */ }}>
                    <iframe 
                      src="http://localhost:8081" 
                      className="absolute inset-0 w-full h-full border-0 rounded-md"
                      title="3D Environment Visualization"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">About the Visualizations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-3">Constellation View</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The Constellation View represents wiki entries as points in 3D space, arranged around a central dodecahedron.
                Each point represents a different notebook entry, and connecting lines represent relationships between content.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                This visualization allows you to see connections between different pieces of content that might not be 
                apparent in a traditional directory structure. It's particularly useful for exploring related concepts
                across different categories.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-3">3D Environment</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The 3D Environment provides an immersive space-like setting with a central dodecahedron and simulated
                star field. This visualization demonstrates the core 3D rendering capabilities used in our projects.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                The environment features realistic stars with accurate astronomical principles, proper lighting, and
                interactive controls that allow you to freely navigate the scene and explore the space around the
                central object.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}