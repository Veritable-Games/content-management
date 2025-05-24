const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
// Serve static files if they exist
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Serve symbol files from Desktop directory
const symbolsPath = path.join('/home/user/Desktop/symbols-copy');
app.use('/symbols', express.static(symbolsPath, {
  setHeaders: (res, path) => {
    // Ensure proper content type
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
    // Set caching headers
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Create a path to the notebooks directory
const notebooksPath = '/Notebooks';

// File management endpoints for editor
app.get('/api/files/:category/:filename', (req, res) => {
    const { category, filename } = req.params;
    const filePath = path.join(notebooksPath, category, filename);
    
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            res.json({
                content,
                filename,
                category,
                lastModified: stats.mtime,
                size: stats.size
            });
        } else {
            // Return empty content for new files
            res.json({
                content: '',
                filename,
                category,
                lastModified: new Date(),
                size: 0
            });
        }
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file' });
    }
});

app.put('/api/files/:category/:filename', (req, res) => {
    const { category, filename } = req.params;
    const { content } = req.body;
    const filePath = path.join(notebooksPath, category, filename);
    
    try {
        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Create backup if file exists
        if (fs.existsSync(filePath)) {
            const backupPath = filePath + '.backup.' + Date.now();
            fs.copyFileSync(filePath, backupPath);
            
            // Clean old backups (keep only 3)
            const backupDir = path.dirname(filePath);
            const baseName = path.basename(filePath);
            const backups = fs.readdirSync(backupDir)
                .filter(f => f.startsWith(baseName + '.backup.'))
                .sort()
                .reverse();
                
            if (backups.length > 3) {
                backups.slice(3).forEach(backup => {
                    fs.unlinkSync(path.join(backupDir, backup));
                });
            }
        }
        
        // Write file
        fs.writeFileSync(filePath, content, 'utf8');
        
        const stats = fs.statSync(filePath);
        res.json({
            success: true,
            filename,
            category,
            lastModified: stats.mtime,
            size: stats.size
        });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

app.get('/', (req, res) => {
    // Return debug page
    return res.sendFile(path.join(__dirname, 'debug.html'));
});

// Add debug endpoints
app.get('/api/debug/env', (req, res) => {
    res.json({
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        cwd: process.cwd(),
        dirname: __dirname
    });
});

app.get('/api/debug/dirs', (req, res) => {
    const dirs = {
        current: fs.readdirSync(process.cwd()),
        backend: fs.readdirSync(__dirname),
        pages: fs.existsSync(path.join(__dirname, 'pages')) ? 
               fs.readdirSync(path.join(__dirname, 'pages')) : 
               'Directory does not exist'
    };
    
    // Check possible dist directories
    const possiblePaths = [
        path.join(__dirname, 'dist'),
        path.join(__dirname, '../dist'),
        path.join(__dirname, '../frontend/dist')
    ];
    
    dirs.distPaths = {};
    possiblePaths.forEach(p => {
        dirs.distPaths[p] = fs.existsSync(p) ? 
                           fs.readdirSync(p) : 
                           'Directory does not exist';
    });
    
    res.json(dirs);
});

// Endpoint to get list of pages
app.get('/api/pages', (req, res) => {
    fs.readdir(path.join(__dirname, 'pages'), (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        const entries = files.map(file => ({
            title: path.basename(file, '.html'),
            path: `/pages/${file}`
        }));
        res.json({ entries });
    });
});

// Endpoint to get page content
app.get('/api/pages/:title', (req, res) => {
    const title = req.params.title;
    const filePath = path.join(__dirname, 'pages', `${title}.html`);
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            return res.status(404).send('Page not found');
        }
        res.json({ title, content });
    });
});

// Endpoint to create a new page
app.post('/api/pages', (req, res) => {
    const { title, content } = req.body;
    const filePath = path.join(__dirname, 'pages', `${title}.html`);
    fs.writeFile(filePath, content, err => {
        if (err) {
            return res.status(500).send('Failed to save page');
        }
        res.send('Page saved');
    });
});

// API routes for notebooks
app.get('/api/notebooks', (req, res) => {
    try {
        // Get all directories in the Notebooks folder
        const notebooks = fs.readdirSync(notebooksPath)
            .filter(item => fs.statSync(path.join(notebooksPath, item)).isDirectory())
            .map(dir => {
                // Count the number of files in the directory
                const dirPath = path.join(notebooksPath, dir);
                const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.txt'));
                
                // Create a slug from the directory name
                const slug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                return {
                    id: slug,
                    name: dir,
                    description: `Notes and documentation for ${dir}`,
                    path: dir,
                    entryCount: files.length
                };
            });
        
        res.json({ notebooks });
    } catch (err) {
        console.error('Error getting notebooks:', err);
        res.status(500).send('Failed to get notebooks');
    }
});

app.get('/api/notebooks/:category', (req, res) => {
    const { category } = req.params;
    try {
        // Find the directory matching the category slug
        const directories = fs.readdirSync(notebooksPath);
        const matchingDir = directories.find(dir => {
            const slug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return slug === category;
        });
        
        if (!matchingDir) {
            return res.status(404).send('Notebook category not found');
        }
        
        // Get all .txt files in the directory
        const dirPath = path.join(notebooksPath, matchingDir);
        const files = fs.readdirSync(dirPath)
            .filter(file => file.endsWith('.txt'))
            .map(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                
                // Create a slug from the file name
                const fileName = path.basename(file, '.txt');
                const slug = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                return {
                    id: slug,
                    title: fileName,
                    path: `/Notebooks/${matchingDir}/${file}`,
                    lastModified: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        res.json({ entries: files });
    } catch (err) {
        console.error('Error getting notebook entries:', err);
        res.status(500).send('Failed to get notebook entries');
    }
});

app.get('/api/notebooks/:category/:entry', (req, res) => {
    const { category, entry } = req.params;
    try {
        // Find the directory matching the category slug
        const directories = fs.readdirSync(notebooksPath);
        const matchingDir = directories.find(dir => {
            const slug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return slug === category;
        });
        
        if (!matchingDir) {
            return res.status(404).send('Notebook category not found');
        }
        
        // Get all .txt files in the directory
        const dirPath = path.join(notebooksPath, matchingDir);
        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.txt'));
        
        // Find the file matching the entry slug
        const matchingFile = files.find(file => {
            const fileName = path.basename(file, '.txt');
            const slug = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return slug === entry;
        });
        
        if (!matchingFile) {
            return res.status(404).send('Entry not found');
        }
        
        // Read the file content
        const filePath = path.join(dirPath, matchingFile);
        const content = fs.readFileSync(filePath, 'utf8');
        
        res.json({
            title: path.basename(matchingFile, '.txt'),
            content,
            lastModified: fs.statSync(filePath).mtime.toISOString()
        });
    } catch (err) {
        console.error('Error getting notebook entry:', err);
        res.status(500).send('Failed to get notebook entry');
    }
});

app.post('/api/notebooks/:category', (req, res) => {
    const { category } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).send('Title and content are required');
    }
    
    try {
        // Find the directory matching the category slug
        const directories = fs.readdirSync(notebooksPath);
        const matchingDir = directories.find(dir => {
            const slug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return slug === category;
        });
        
        if (!matchingDir) {
            return res.status(404).send('Notebook category not found');
        }
        
        // Create the file
        const filePath = path.join(notebooksPath, matchingDir, `${title}.txt`);
        fs.writeFileSync(filePath, content);
        
        res.status(201).send('Entry created');
    } catch (err) {
        console.error('Error creating notebook entry:', err);
        res.status(500).send('Failed to create notebook entry');
    }
});

app.put('/api/notebooks/:category/:entry', (req, res) => {
    const { category, entry } = req.params;
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).send('Content is required');
    }
    
    try {
        // Find the directory matching the category slug
        const directories = fs.readdirSync(notebooksPath);
        const matchingDir = directories.find(dir => {
            const slug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return slug === category;
        });
        
        if (!matchingDir) {
            return res.status(404).send('Notebook category not found');
        }
        
        // Get all .txt files in the directory
        const dirPath = path.join(notebooksPath, matchingDir);
        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.txt'));
        
        // Find the file matching the entry slug
        const matchingFile = files.find(file => {
            const fileName = path.basename(file, '.txt');
            const slug = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return slug === entry;
        });
        
        if (!matchingFile) {
            return res.status(404).send('Entry not found');
        }
        
        // Update the file content
        const filePath = path.join(dirPath, matchingFile);
        fs.writeFileSync(filePath, content);
        
        res.send('Entry updated');
    } catch (err) {
        console.error('Error updating notebook entry:', err);
        res.status(500).send('Failed to update notebook entry');
    }
});

// Search API endpoint
app.get('/api/search', (req, res) => {
    const { q, category } = req.query;
    
    if (!q) {
        return res.status(400).send('Search query is required');
    }
    
    try {
        const results = [];
        
        // Get all directories (or just the specified category)
        const directories = fs.readdirSync(notebooksPath)
            .filter(dir => fs.statSync(path.join(notebooksPath, dir)).isDirectory())
            .filter(dir => {
                if (!category || category === 'all') return true;
                const slug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return slug === category;
            });
        
        // Search in each directory
        for (const dir of directories) {
            const dirPath = path.join(notebooksPath, dir);
            const dirSlug = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            
            // Get all .txt files in the directory
            const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.txt'));
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const fileName = path.basename(file, '.txt');
                const fileSlug = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                // Get file content
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Check if the query is in the content or filename
                if (
                    content.toLowerCase().includes(q.toLowerCase()) ||
                    fileName.toLowerCase().includes(q.toLowerCase())
                ) {
                    // Get statistics of the file
                    const stats = fs.statSync(filePath);
                    
                    // Create an excerpt that includes the search term
                    let excerpt = '';
                    const contentLower = content.toLowerCase();
                    const queryLower = q.toLowerCase();
                    const queryIndex = contentLower.indexOf(queryLower);
                    
                    if (queryIndex !== -1) {
                        // Get some context around the match
                        const startIndex = Math.max(0, queryIndex - 60);
                        const endIndex = Math.min(content.length, queryIndex + q.length + 60);
                        excerpt = content.substring(startIndex, endIndex);
                        
                        // Add ellipsis at the beginning and end if needed
                        if (startIndex > 0) excerpt = '...' + excerpt;
                        if (endIndex < content.length) excerpt = excerpt + '...';
                    } else {
                        // If the match was in the filename, just use the beginning of the content
                        excerpt = content.substring(0, 120) + '...';
                    }
                    
                    // Add to results
                    results.push({
                        id: fileSlug,
                        title: fileName,
                        category: dirSlug,
                        path: `/notebooks/${dirSlug}/${fileSlug}`,
                        excerpt,
                        lastModified: stats.mtime.toISOString()
                    });
                }
            }
        }
        
        // Sort by last modified, newest first
        results.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        res.json({ 
            query: q,
            count: results.length,
            results
        });
    } catch (err) {
        console.error('Error searching notebooks:', err);
        res.status(500).send('Failed to search notebooks');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

