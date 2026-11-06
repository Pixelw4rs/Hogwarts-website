# Builds the React site (web/) into /site. The server stays a read-only mounted folder and
# data/ stays the volume for the database and uploads; see docker-compose.yml.
FROM node:22-alpine AS build
WORKDIR /src
COPY web/package.json web/package-lock.json web/
RUN cd web && npm ci --no-audit --no-fund
COPY web web
# the motion layer, stores and helpers are still shared from data/ during the move
COPY data/js data/js
COPY data/css data/css
COPY data/hogwarts-bg.jpg data/
RUN cd web && npm run build

FROM node:22-alpine
COPY --from=build /src/web/dist /site
WORKDIR /app
CMD ["node", "server.js"]
