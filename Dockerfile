FROM node:lts

WORKDIR /home/PlexBot/

COPY package*.json ./

RUN npm install

COPY . .

CMD node index.js
