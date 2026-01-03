# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the HTML and CSS files to the Nginx web server directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

# Set proper permissions for the files
RUN chmod -R 644 /usr/share/nginx/html/*

# Expose port 80 to the outside world
EXPOSE 80

# The default command to run Nginx
CMD ["nginx", "-g", "daemon off;"]