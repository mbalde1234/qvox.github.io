FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

# Remove default content and copy site
RUN rm -rf ./*
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
