# One image that runs the API and serves the built React app.
# Multi-stage: build tools live in the first two stages and are thrown away;
# only the final stage becomes the image.

# --- Stage 1: build the React app into static files ---
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Stage 2: compile the API, then drop devDependencies ---
FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build && npm prune --omit=dev

# --- Stage 3: the image that actually runs ---
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=server-build /app/server/package.json ./
COPY --from=server-build /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./public
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
