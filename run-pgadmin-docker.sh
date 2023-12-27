#!/bin/zsh
docker run -p 8080:8080 -d -e PGADMIN_DEFAULT_EMAIL=admin@admin.com -e PGADMIN_DEFAULT_PASSWORD=docker -e PGADMIN_LISTEN_PORT=8080 --rm --name pgadmin dpage/pgadmin4