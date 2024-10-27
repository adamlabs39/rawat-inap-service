FROM node:19.5.0-alpine

WORKDIR /adameds-rawat-inap
LABEL application="rawat inap service"
ENV APP_PORT=8085
ENV APP_HOST=0.0.0.0
COPY . .
RUN npm install
CMD ["npm", "run", "start"]
