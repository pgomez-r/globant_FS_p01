# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/docker_app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build && ls -la /usr/src/docker_app/build

# Install Python
RUN apk add --no-cache python3

# Expose the port the app runs on
EXPOSE 5500

# Command to run the application
CMD ["npm", "start"]