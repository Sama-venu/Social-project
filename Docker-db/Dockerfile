FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root123
ENV MYSQL_DATABASE=instagram_clone
ENV MYSQL_USER=instagram_user
ENV MYSQL_PASSWORD=insta123

COPY src/init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
