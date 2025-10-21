# FROM node:18
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# EXPOSE 3000
# CMD ["npm", "start"]


# Dockerfile for Frontend (Production)

# --- Stage 1: Build ---
# Use a Node.js image to build the static assets.
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the production build script, which creates the /app/build directory
RUN npm run build

# --- Stage 2: Serve ---
# Use a lightweight NGINX server to serve the static files.
FROM nginx:1.25-alpine

# Copy the built assets from the 'builder' stage
COPY --from=builder /app/build /usr/share/nginx/html

# NGINX listens on port 80 by default
EXPOSE 80

# The default NGINX command will start the server. No CMD needed.
