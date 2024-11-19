# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/docker_app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Install Python
RUN apt-get update && apt-get install -y python3

# Expose the port the app runs on
EXPOSE 5500

# Command to run the application
CMD ["npm", "start"]