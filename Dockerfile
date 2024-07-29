# Stage 1: Build the Angular application
FROM node:18 AS build

# Set the working directory
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Build the application
RUN npm run build --prod

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the first stage
COPY --from=build /app/dist/web-editor/browser /usr/share/nginx/html

# Copy a custom Nginx configuration file if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
