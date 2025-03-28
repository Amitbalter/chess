FROM node:23.3.0

WORKDIR /chess/client

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

