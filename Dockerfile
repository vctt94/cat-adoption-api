# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
COPY .npmrc .npmrc
RUN npm install

# Bundle app source
COPY . .

# Make port available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=development

# Run the app when the container launches
CMD ["npm", "run", "start"]
