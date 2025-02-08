FROM node:alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install --save-dev nodemon
CMD ["npm", "run", "dev:reservations"] 

FROM node:alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "-r", "tsconfig-paths/register", "dist/services/reservations/src/index.js"]

