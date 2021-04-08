FROM node:14.16-alpine
ARG REDIS_HOST
ARG AUTH_SERVER_URL
ARG AUTH_SERVER_USER
ARG AUTH_SERVER_PASSWORD
ARG ENCODED_GOOGLE_APPLICATION_CREDENTIALS

ENV REDIS_HOST=${REDIS_HOST} \
    AUTH_SERVER_URL=${AUTH_SERVER_URL} \
    AUTH_SERVER_USER=${AUTH_SERVER_USER} \
    AUTH_SERVER_PASSWORD=${AUTH_SERVER_PASSWORD} \
    ENCODED_GOOGLE_APPLICATION_CREDENTIALS=${ENCODED_GOOGLE_APPLICATION_CREDENTIALS}


WORKDIR /usr/src/app/

COPY src src/
COPY package.json yarn.lock .env tsconfig.json ./

RUN yarn
RUN yarn build

EXPOSE 9000 9001

CMD ["node", "."]
