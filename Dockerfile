# Production Dockerfile
#
# Example:
# docker build . -t page_screenshot
# docker run -v /page_screenshot_logs:/app/logs page_screenshot

FROM node:12.16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
ENV PORT=3005
EXPOSE $PORT
CMD [ "npm", "start"]