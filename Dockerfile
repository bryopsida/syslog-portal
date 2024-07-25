FROM node:20.15.1-alpine3.20 as build-base
RUN apk add --update --no-cache \
  python3 \
  make \
  g++ \
  bash \
  gcc

FROM build-base AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json .
RUN npm run build

FROM build-base AS libraries
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20.15.1-alpine3.20
RUN apk add --update --no-cache dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node package*.json /usr/src/app/
COPY --chown=node:node --from=libraries /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/dist/ /usr/src/app/
EXPOSE 1514
EXPOSE 8080
EXPOSE 9091
CMD ["dumb-init", "node", "app.js"]