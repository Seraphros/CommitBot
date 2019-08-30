FROM node:latest

COPY .  app/

WORKDIR app/

RUN npm install
RUN npm install mysql

CMD ["node", "bot.js"]
