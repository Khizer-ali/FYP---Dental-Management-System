FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Install build-time dependencies (only if needed for 'npm run build')
# 1. Update repositories and 2. Install dependencies
RUN apk update && apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-dev \
    leptonica-dev \
    poppler-utils \
    mesa-gl \
    glib \
    build-base

# Build the app
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine
# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]