FROM node:19.5.0-alpine

WORKDIR /adameds-rawat-inap
LABEL application="rawat inap service"
ENV APP_PORT=8085
ENV APP_HOST=0.0.0.0
COPY . .
RUN npm install
RUN npm install -g @infisical/cli
CMD ["sh", "-c", "infisical run --env=staging -- npm run start"]
