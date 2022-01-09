FROM node:12 as build

WORKDIR /home/PlexBot/

COPY package*.json ./

RUN npm install

FROM node:12-slim as final

WORKDIR /home/PlexBot/

COPY --from=build /home/PlexBot/ .

COPY . .

cmd node index.js
