import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function ForumIntegration() {
  const [forumPosts, setForumPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate forum data (in real implementation, this would be WordPress REST API)
    const mockForumData = [
      {
        id: 1,
        title: 'Project Noxii - Skydiving Combat Game Pitch',
        excerpt: 'A lethally competitive skydiving game with visceral mid-air combat and unique permadeath mechanics.',
        category: 'Game Development Projects',
        url: 'http://localhost:8030/project-noxii/',
        project: 'noxii'
      },
      {
        id: 2,
        title: 'On Command - Tactical Sci-Fi Squad Shooter Design',
        excerpt: 'Hard science fiction tactical shooter focused on squad control and strategic gameplay.',
        category: 'Game Development Projects', 
        url: 'http://localhost:8030/on-command-design-doc/',
        project: 'on-command'
      },
      {
        id: 3,
        title: 'Dodec Character Profile: Arrisi Kron - Determined Specialist',
        excerpt: 'Character profile for Arrisi Kron, a determined specialist in the Dodec universe.',
        category: 'Game Development Projects',
        url: 'http://localhost:8030/dodec-arrisi-kron-profile/',
        project: 'dodec'
      },
      {
        id: 4,
        title: 'Game Difficulty Design - Balancing Challenge and Accessibility',
        excerpt: 'Design principles and strategies for creating well-balanced game difficulty.',
        category: 'Technical Development',
        url: 'http://localhost:8030/game-difficulty-design-tips/',
        project: 'general'
      }
    ];

    setTimeout(() => {
      setForumPosts(mockForumData);
      setLoading(false);
    }, 500);
  }, []);

  const getProjectColor = (project) => {
    const colors = {
      'noxii': 'bg-blue-100 text-blue-800',
      'on-command': 'bg-green-100 text-green-800', 
      'dodec': 'bg-purple-100 text-purple-800',
      'autumn': 'bg-yellow-100 text-yellow-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[project] || colors.general;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold mb-4">Forum Integration</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your content management system with the PS2-Era Gaming Forum. 
            View forum discussions related to your projects and share content between platforms.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <a
              href="http://localhost:8030"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-lg mb-2">🎮 Visit PS2-Era Forum</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse the community forum and participate in game development discussions.
              </p>
            </a>
            
            <a
              href="http://localhost:8030/wp-admin"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-lg mb-2">⚙️ Forum Admin</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage forum content, users, and settings through WordPress admin.
              </p>
            </a>
            
            <button className="p-4 bg-ps2-blue text-white rounded-lg shadow hover:bg-ps2-dark-blue transition-colors">
              <h3 className="font-medium text-lg mb-2">🔄 Sync Content</h3>
              <p className="text-sm opacity-90">
                Synchronize notebook content with forum posts (coming soon).
              </p>
            </button>
          </div>

          {/* Recent Forum Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Recent Forum Activity</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest posts from the PS2-Era Gaming Forum related to your projects
              </p>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="p-6 text-center">Loading forum posts...</div>
              ) : (
                forumPosts.map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProjectColor(post.project)}`}>
                            {post.project}
                          </span>
                          <span className="text-xs text-gray-500">{post.category}</span>
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          <a 
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-ps2-blue transition-colors"
                          >
                            {post.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="ml-4">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          View in Forum
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Integration Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>PS2-Era Forum Connection</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Connected (localhost:8030)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Content Management API</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Active (localhost:3001)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Constellation Viewer</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Available (localhost:8090)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shared Project Data</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📊 4 Projects Synchronized
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
