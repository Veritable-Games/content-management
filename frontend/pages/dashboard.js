import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function CollaborativeDashboard() {
  const [activityFeed, setActivityFeed] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({});
  const [quickActions, setQuickActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get unified activity feed
      const activityResponse = await fetch('http://localhost:3001/api/collaborative/activity/feed');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityFeed(activityData.activities || []);
      }

      // Check service status
      const services = {
        'Content Management': { url: 'http://localhost:3000', port: 3000, status: 'online' },
        'Backend API': { url: 'http://localhost:3001', port: 3001, status: 'checking' },
        'PS2-Era Forum': { url: 'http://localhost:8030', port: 8030, status: 'checking' },
        'Constellation Viewer': { url: 'http://localhost:8090', port: 8090, status: 'checking' }
      };

      // Quick health checks
      for (const [name, service] of Object.entries(services)) {
        if (name === 'Content Management') continue; // We're already here
        
        try {
          const healthCheck = await fetch(`http://localhost:3001/api/health`, { 
            method: 'GET',
            mode: 'no-cors' 
          });
          services[name].status = 'online';
        } catch (error) {
          services[name].status = 'offline';
        }
      }

      setServiceStatus(services);

      // Set up quick actions based on current projects
      setQuickActions([
        {
          title: 'Share to Forum',
          description: 'Post current notebook content to PS2-Era Forum',
          action: 'share-forum',
          icon: '🎮',
          enabled: services['PS2-Era Forum'].status === 'online'
        },
        {
          title: 'Add to Constellation',
          description: 'Visualize content in 3D constellation',
          action: 'add-constellation',
          icon: '🌌',
          enabled: services['Constellation Viewer'].status === 'online'
        },
        {
          title: 'Sync All Content',
          description: 'Synchronize content across all services',
          action: 'sync-all',
          icon: '🔄',
          enabled: true
        },
        {
          title: 'View Forum Activity',
          description: 'See latest discussions and posts',
          action: 'view-forum',
          icon: '💬',
          enabled: services['PS2-Era Forum'].status === 'online'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setLoading(false);
    }
  };

  const executeQuickAction = async (action) => {
    switch (action) {
      case 'share-forum':
        window.open('/share-to-forum', '_blank');
        break;
      case 'add-constellation':
        window.open('/integration', '_blank');
        break;
      case 'sync-all':
        await syncAllContent();
        break;
      case 'view-forum':
        window.open('http://localhost:8030', '_blank');
        break;
    }
  };

  const syncAllContent = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/collaborative/sync/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookEntry: {
            title: 'Recent Activity Sync',
            content: 'Synchronizing content across all collaborative services',
            category: 'general'
          },
          targetServices: ['forum', 'constellation']
        })
      });

      if (response.ok) {
        alert('Content synchronized across all services!');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <section>
          <h1 className="text-3xl font-bold mb-2">Collaborative Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Unified view of all your game development services and activities
          </p>
        </section>

        {/* Service Status Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(serviceStatus).map(([name, service]) => (
            <div key={name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm">{name}</h3>
                  <p className="text-xs text-gray-500">Port {service.port}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'online' ? 'bg-green-500' :
                  service.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
              </div>
              <a 
                href={service.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-ps2-blue hover:underline mt-2 block"
              >
                Open Service →
              </a>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => executeQuickAction(action.action)}
                disabled={!action.enabled}
                className={`p-4 rounded-lg text-left transition-colors ${
                  action.enabled 
                    ? 'bg-white dark:bg-gray-800 shadow hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700' 
                    : 'bg-gray-100 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Unified Activity Feed */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">Loading activity feed...</div>
            ) : activityFeed.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent activity across services
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">{activity.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">
                            <a 
                              href={activity.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-ps2-blue"
                            >
                              {activity.title}
                            </a>
                          </h3>
                          <span className="text-xs text-gray-500">{activity.service}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cross-Service Links */}
        <section>
          <h2 className="text-xl font-bold mb-4">Service Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-medium mb-2">📝 → 🎮</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Share notebook content directly to PS2-Era Forum
              </p>
              <a href="/share-to-forum" className="btn-secondary text-sm">
                Create Forum Post
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-medium mb-2">📝 → 🌌</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Visualize content relationships in 3D space
              </p>
              <a href="/integration" className="btn-secondary text-sm">
                Add to Constellation
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-medium mb-2">🎮 ↔ 🌌</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Forum discussions linked to visual exploration
              </p>
              <a href="/forum" className="btn-secondary text-sm">
                View Integration
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
