# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build for production
COPY . .
RUN npm run build

# Stage 2: Serve the application with NGINX
FROM nginx:alpine

# Copy the compiled files from Stage 1 into NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]