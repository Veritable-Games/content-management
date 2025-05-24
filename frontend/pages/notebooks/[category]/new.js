import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';

export default function CreateNotebookEntry() {
  const router = useRouter();
  const { category } = router.query;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Try to submit to the real API
      const response = await fetch(`http://localhost:3001/api/notebooks/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      // Generate a slug from the title
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      if (response.ok) {
        // Redirect to the entry page on success
        router.push(`/notebooks/${category}/${slug}`);
      } else {
        // Handle API error
        const errorData = await response.text();
        setError(`Failed to create entry: ${errorData}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Failed to create entry. Please try again later.');
      setIsSubmitting(false);
      
      // For demo purposes, redirect anyway after a delay
      setTimeout(() => {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        router.push(`/notebooks/${category}/${slug}`);
      }, 2000);
    }
  };

  if (!category) {
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
              <Link 
                href={`/notebooks?category=${category}`}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {notebookCategories[category]}
              </Link>
              <svg className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 dark:text-white font-medium">Create New Entry</span>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold">Create New Entry</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add a new entry to {notebookCategories[category]}
            </p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-400 mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input w-full"
                  placeholder="Enter a title for your entry"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Simple markdown formatting is supported (# headers, ## subheaders, - list items)
                </div>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-ps2-blue focus:border-ps2-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="# Your Title&#10;&#10;Content goes here...&#10;&#10;## Subheading&#10;&#10;- List item 1&#10;- List item 2"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}