# Frontend Dockerfile - build with Vite and serve with nginx

# build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine
# copy built assets
COPY --from=build /app/dist /usr/share/nginx/html
# nginx listens on 80 by default
EXPOSE 80

# default command (already defined by base image)
