FROM node:lts

WORKDIR /home/PlexBot/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 32400

CMD node index.js