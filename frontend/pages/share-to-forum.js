import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function ShareToForum() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState('');
  const [selectedEntry, setSelectedEntry] = useState('');
  const [entries, setEntries] = useState([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [sharing, setSharing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  useEffect(() => {
    if (selectedNotebook) {
      fetchEntries(selectedNotebook);
    }
  }, [selectedNotebook]);

  const fetchNotebooks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notebooks');
      if (response.ok) {
        const data = await response.json();
        setNotebooks(data.notebooks || []);
      }
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    }
  };

  const fetchEntries = async (notebookId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notebooks/${notebookId}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const shareToForum = async () => {
    if (!selectedEntry && !customTitle) {
      alert('Please select an entry or provide custom content');
      return;
    }

    setSharing(true);
    try {
      let postData;

      if (selectedEntry) {
        // Get the full entry content
        const entryResponse = await fetch(`http://localhost:3001/api/notebooks/${selectedNotebook}/${selectedEntry}`);
        if (!entryResponse.ok) throw new Error('Failed to fetch entry content');
        
        const entryData = await entryResponse.json();
        const selectedEntryInfo = entries.find(e => e.id === selectedEntry);
        
        postData = {
          title: `[Project Discussion] ${selectedEntryInfo.title}`,
          content: `<h2>${selectedEntryInfo.title}</h2>

<p><strong>From Content Management System</strong></p>

<div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 15px 0;">
${entryData.content.replace(/\n/g, '<br>')}
</div>

<p><em>This content was shared from the Content Management system. Join the discussion below!</em></p>

<p>Related Projects: ${selectedNotebook.replace('-wiki', '')}</p>`,
          category: selectedNotebook
        };
      } else {
        // Use custom content
        postData = {
          title: customTitle,
          content: `<div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 15px 0;">
${customContent.replace(/\n/g, '<br>')}
</div>

<p><em>This content was shared from the Content Management system. Join the discussion below!</em></p>`,
          category: 'general'
        };
      }

      const response = await fetch('http://localhost:3001/api/collaborative/forum/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const result = await response.json();
        setResult({
          success: true,
          url: result.url,
          message: 'Successfully shared to PS2-Era Forum!'
        });
      } else {
        throw new Error('Failed to create forum post');
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error sharing to forum: ${error.message}`
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <section>
          <h1 className="text-3xl font-bold mb-4">Share to PS2-Era Forum</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your notebook content or create custom posts for the gaming forum community.
          </p>
        </section>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <p className="font-medium">{result.message}</p>
            {result.success && result.url && (
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm underline block mt-2"
              >
                View Forum Post →
              </a>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Share Existing Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Notebook</label>
                  <select 
                    className="input w-full"
                    value={selectedNotebook}
                    onChange={(e) => setSelectedNotebook(e.target.value)}
                  >
                    <option value="">Choose a notebook...</option>
                    {notebooks.map(notebook => (
                      <option key={notebook.id} value={notebook.id}>
                        {notebook.name} ({notebook.entryCount} entries)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedNotebook && entries.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Entry</label>
                    <select 
                      className="input w-full"
                      value={selectedEntry}
                      onChange={(e) => setSelectedEntry(e.target.value)}
                    >
                      <option value="">Choose an entry...</option>
                      {entries.map(entry => (
                        <option key={entry.id} value={entry.id}>
                          {entry.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Or Create Custom Post</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Title</label>
                  <input 
                    type="text"
                    className="input w-full"
                    placeholder="Enter forum post title..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custom Content</label>
                  <textarea 
                    className="input w-full h-32"
                    placeholder="Enter your forum post content..."
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button 
                onClick={shareToForum}
                disabled={sharing || (!selectedEntry && !customTitle)}
                className={`btn-primary ${sharing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sharing ? 'Sharing...' : 'Share to Forum'} 🎮
              </button>
              
              <a 
                href="http://localhost:8030" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View Forum
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
