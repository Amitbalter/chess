FROM node:23.3.0

WORKDIR /chess/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1234

CMD ["npm", "start"]