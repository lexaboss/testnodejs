FROM node:4-onbuild

RUN apt-get update
RUN apt-get install -y mc nano

ENV TERM xterm

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY /test-api/package.json .

RUN apt-get install g++
RUN npm install --save babel-cli
RUN npm install --save couchbase
RUN npm install --save ottoman
RUN npm install --save cors
RUN npm install --save express-ipfilter
RUN npm install --save nodemon
RUN npm install babel-preset-es2015

# Bundle app source
COPY ./test-api ./test-api

EXPOSE 8888

CMD [ "npm", "start" ]