# FROM node:22.15.0-alpine

# WORKDIR /app

# COPY package.json package-lock.json* ./
# RUN npm install
# RUN npm install --save-dev nodemon  

# COPY . .

# EXPOSE 3000

# CMD ["npx", "nodemon", "server.js"]  


FROM node:22.15.0-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
