FROM hardcoreeng/base:v20250113a
WORKDIR /usr/src/app

COPY bundle/bundle.js ./
COPY bundle/bundle.js.map ./

CMD [ "node", "bundle.js" ]

