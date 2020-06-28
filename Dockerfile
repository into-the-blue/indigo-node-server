FROM node:12.13.1

RUN mkdir -p /apps/node-server

WORKDIR /apps/node-server

COPY . .

RUN npm install

RUN npm run preRun && npm run clean && npm run build

