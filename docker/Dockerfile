FROM node:18-slim

RUN apt-get update && \
apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 libgbm1 \
ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget tzdata locales locales-all

ENV TZ=Europe/Prague
ENV LC_ALL cs_CZ.UTF-8

RUN mkdir /app

WORKDIR /app

EXPOSE 9797

COPY lib ./lib
COPY public ./public
COPY config ./config
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm ci && npm cache clean --force

CMD ["node", "./lib/index.js"]
