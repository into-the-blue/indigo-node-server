FROM node:12.13.1

RUN mkdir -p /apps/node-server

WORKDIR /apps/node-server

COPY package.json /apps/node-server/

COPY tsconfig.json /apps/node-server/

RUN npm install
