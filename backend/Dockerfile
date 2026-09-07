FROM node:20-alpine

WORKDIR /app

# Install dependencies first so this layer is cached unless package.json changes
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
