FROM node:22.5.1

WORKDIR /root/networth-server

COPY . .
RUN npm install

CMD ["npm", "run", "start:prod"]