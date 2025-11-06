FROM node:25-alpine3.22

WORKDIR /adameds-rawat-inap
LABEL application="rawat inap service"
ENV APP_PORT=8091
ENV APP_HOST=0.0.0.0
COPY . .
RUN npm install
CMD ["npm", "run", "start"]
