FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The topics the repo publishes. At start they are laid out under the app's
# persistent data directory, and content/ becomes a link to it.
RUN mv content published
# Only the owner's requests may save annotations, tags and archive flags.
ENV LFS_WRITE_REQUIRES_HEADER=X-OpenHost-Is-Owner
EXPOSE 8080
CMD ["node", "bottle-start.mjs"]
