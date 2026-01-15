# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# Run stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
