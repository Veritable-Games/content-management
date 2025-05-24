import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';

export default function NotebookEntry() {
  const router = useRouter();
  const { category, entry } = router.query;
  
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  
  // Mock data for notebook categories to display the category name
  const notebookCategories = {
    'all-of-it': 'All of it Anything Everything At Once',
    'llm-confusion': 'LLM Confusion',
    'autumn-wiki': 'Autumn Wiki Pages',
    'dodec-wiki': 'Dodec Wiki Pages',
    'noxii-wiki': 'Noxii Wiki Pages',
    'on-command-wiki': 'On Command Wiki Pages',
    'reference-wiki': 'Reference Wiki Pages'
  };

  useEffect(() => {
    if (!category || !entry) return;
    
    // Check for edit mode in query parameters
    if (router.query.edit === 'true') {
      setEditMode(true);
    }
    
    // Fetch entry content from API
    const fetchEntryContent = async () => {
      setLoading(true);
      try {
        // Try to fetch from the real API
        const response = await fetch(`http://localhost:3001/api/notebooks/${category}/${entry}`);
        
        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
          setEditedContent(data.content);
        } else {
          // Fallback to mock data if API request fails
          const mockContent = `# ${entry.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}

This is mock content for entry "${entry}" in the "${notebookCategories[category]}" notebook.

## Overview

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nunc eget nisl. Nullam auctor, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nunc eget nisl.

## Details

- Item 1: Description of item 1
- Item 2: Description of item 2
- Item 3: Description of item 3

## Notes

This is a placeholder for a real notebook entry that would be stored in the system.
`;
          
          setContent(mockContent);
          setEditedContent(mockContent);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching entry content:', err);
        
        // Fallback to mock data on error
        const mockContent = `# ${entry.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}

This is mock content for entry "${entry}" in the "${notebookCategories[category]}" notebook.

## Overview

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nunc eget nisl.

## Details

- Item 1: Description of item 1
- Item 2: Description of item 2
- Item 3: Description of item 3

## Notes

This is a placeholder for a real notebook entry that would be stored in the system.
`;
        
        setContent(mockContent);
        setEditedContent(mockContent);
        setLoading(false);
      }
    };

    fetchEntryContent();
  }, [category, entry, router.query.edit]);

  const handleSave = async () => {
    try {
      // Try to save to the real API
      const response = await fetch(`http://localhost:3001/api/notebooks/${category}/${entry}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent })
      });
      
      if (response.ok) {
        // Update succeeded
        setContent(editedContent);
        setEditMode(false);
      } else {
        // If the API call fails, show an error but still update the local state
        console.error('Failed to save content to API');
        setContent(editedContent);
        setEditMode(false);
      }
    } catch (err) {
      console.error('Error saving content:', err);
      // Even if the save fails, update the local state
      setContent(editedContent);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setEditMode(false);
  };

  if (!category || !entry) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Home
              </Link>
              <svg className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <Link href="/notebooks" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Notebooks
              </Link>
              <svg className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300">{notebookCategories[category]}</span>
              <svg className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 dark:text-white font-medium">{entry.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}</span>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{entry.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}</h1>
            <div className="flex space-x-2">
              {editMode ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setEditMode(true)}
                  className="btn-primary"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 mx-auto text-ps2-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading content...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : editMode ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-ps2-blue focus:border-ps2-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {content.split('\n').map((line, index) => {
                  // Very simple markdown-like rendering
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-6 mb-1">{line.substring(2)}</li>;
                  } else if (line === '') {
                    return <p key={index} className="my-2">&nbsp;</p>;
                  } else {
                    return <p key={index} className="my-2">{line}</p>;
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}