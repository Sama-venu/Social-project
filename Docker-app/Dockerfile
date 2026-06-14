# Multi-stage build for frontend and backend
FROM node:18-alpine as backend

WORKDIR /app/backend

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/server.js ./

# Frontend build stage
FROM node:18-alpine as frontend

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/ ./

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend /app/backend

# Copy frontend files to be served by nginx
COPY --from=frontend /app/frontend /app/frontend

# Install http-server for serving frontend
RUN npm install -g http-server

EXPOSE 3000 8080

# Start both backend and frontend
CMD sh -c "cd /app/backend && node server.js & cd /app/frontend && http-server -p 8080 --cors"
