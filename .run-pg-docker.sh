docker run --rm --name pg -e POSTGRES_PASSWORD=docker -e POSTGRES_USER=docker -d -p 5432:5432 postgres &&
docker run -p 8080:8080 -d -e PGADMIN_DEFAULT_EMAIL=admin@admin.com -e PGADMIN_DEFAULT_PASSWORD=docker -e PGADMIN_LISTEN_PORT=8080 --rm --name pgadmin dpage/pgadmin4
