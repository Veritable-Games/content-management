import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Editor() {
  const router = useRouter();
  const { file, category } = router.query;
  
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [relatedFiles, setRelatedFiles] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  const editorRef = useRef(null);
  const autosaveInterval = useRef(null);

  useEffect(() => {
    if (file) {
      loadFile();
      loadRelatedFiles();
    }
  }, [file, category]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && content && filename) {
      autosaveInterval.current = setTimeout(() => {
        saveFile(true); // true for autosave
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (autosaveInterval.current) {
        clearTimeout(autosaveInterval.current);
      }
    };
  }, [content, isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setPreviewMode(!previewMode);
      }
      if (e.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewMode]);

  const loadFile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3002/api/files/${category}/${file}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || '');
        setOriginalContent(data.content || '');
        setFilename(data.filename || file);
        setLastSaved(new Date(data.lastModified));
      } else {
        // New file
        setContent('');
        setOriginalContent('');
        setFilename(file);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async (isAutosave = false) => {
    if (!content && !isAutosave) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:3002/api/files/${category}/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename })
      });
      
      if (response.ok) {
        setOriginalContent(content);
        setIsDirty(false);
        setLastSaved(new Date());
        if (!isAutosave) {
          alert('File saved successfully!');
        }
      } else {
        throw new Error('Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      if (!isAutosave) {
        alert('Failed to save file. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loadRelatedFiles = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/search?q=${file?.replace(/\.[^/.]+$/, '')}`);
      if (response.ok) {
        const data = await response.json();
        setRelatedFiles(data.results?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error loading related files:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const insertText = (before, after = '') => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = content.substring(0, start) + newText + content.substring(end);
    
    setContent(newContent);
    setIsDirty(true);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length;
      editor.setSelectionRange(newCursorPos, newCursorPos);
      editor.focus();
    }, 0);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(e.target.value !== originalContent);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading editor...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {filename}
                {isDirty && <span className="text-red-500 ml-1">*</span>}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                {previewMode ? '📝 Edit' : '👁️ Preview'}
              </button>
              <button
                onClick={() => saveFile()}
                disabled={isSaving || !isDirty}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => insertText('**', '**')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">Bold</button>
                <button onClick={() => insertText('*', '*')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">Italic</button>
                <button onClick={() => insertText('`', '`')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">Code</button>
                <button onClick={() => insertText('# ', '')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">H1</button>
                <button onClick={() => insertText('## ', '')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">H2</button>
                <button onClick={() => insertText('### ', '')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">H3</button>
                <button onClick={() => insertText('- ', '')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">List</button>
                <button onClick={() => insertText('[', '](url)')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">Link</button>
                <button onClick={() => insertText('[[', ']]')} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">Wiki</button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-medium text-gray-900 mb-2">Search Results</h3>
                {searchResults.map((result, index) => (
                  <div key={index} className="mb-3 p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium text-blue-600">{result.title}</div>
                    <div className="text-gray-600 text-xs">{result.path}</div>
                    <div className="text-gray-700 mt-1">{result.excerpt}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Related Files */}
            {relatedFiles.length > 0 && (
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-medium text-gray-900 mb-2">Related Files</h3>
                {relatedFiles.map((file, index) => (
                  <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium text-blue-600">{file.title}</div>
                    <div className="text-gray-600 text-xs">{file.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {previewMode ? (
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
                </div>
              </div>
            ) : (
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing..."
                className="flex-1 p-6 font-mono text-sm resize-none outline-none border-none"
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            )}
            
            {/* Status Bar */}
            <div className="bg-gray-100 px-6 py-2 text-sm text-gray-600 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Lines: {content.split('\\n').length} | Characters: {content.length}</span>
                <span>
                  Shortcuts: Ctrl+S (Save) | Ctrl+E (Preview) | Esc (Back)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}