FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose NestJS port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
