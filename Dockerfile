FROM node:12

WORKDIR /home/PlexBot/

COPY package*.json ./

RUN npm install

COPY . .

CMD node index.js
