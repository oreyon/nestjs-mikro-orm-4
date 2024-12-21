# Stage 1: Build the application
FROM node:20.15-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies to build the application
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create a smaller image for production
FROM node:20.15-alpine

# Create app directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/tsconfig*.json /app/
COPY --from=builder /app/dist /app/dist

RUN npm install --only=production

# Use the custom entrypoint script ping the database before starting the application
COPY entrypoint.sh /app/

# Expose the API port
EXPOSE 9000

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"]