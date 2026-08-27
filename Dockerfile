FROM node:18-alpine

WORKDIR /app

# Install native module build dependencies for Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000

CMD ["node", "backend/index.js"]
