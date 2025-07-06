FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Create applogs directory
RUN mkdir -p /app/applogs

# Copy package and lock files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy rest of the source code
COPY . .

# Build the app
RUN pnpm run build

# Expose port
EXPOSE 8000

# Start app
# Use an environment variable to determine mode (default: development)
CMD ["pnpm", "run", "start:dev"]
