FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies for Express server
RUN npm install express body-parser cors

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p dist pages

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Start the server
CMD ["node", "server.js"]