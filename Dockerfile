FROM node:14.14-slim

RUN apt update \
  && apt install -y git ssh tar gzip ca-certificates

RUN mkdir /blog
WORKDIR /blog

ADD entrypoint.sh /
ADD package*.json /blog/
ADD gulpfile.js /blog/

RUN npm install

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]