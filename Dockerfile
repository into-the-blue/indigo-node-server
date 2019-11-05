FROM node:alpine

RUN mkdir -p /apps/node-server

WORKDIR /apps/node-server

COPY package.json /apps/node-server

RUN npm install
