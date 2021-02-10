FROM node:14.13.1-alpine

RUN apk --no-cache add --virtual builds-deps build-base python

WORKDIR /home/node/

COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
#RUN yarn remove bcrypt && yarn add bcrypt
RUN yarn build; exit 0

CMD ["yarn", "start"]

EXPOSE 80
