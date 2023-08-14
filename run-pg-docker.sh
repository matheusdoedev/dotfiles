#!/bin/zsh
docker run --rm --name pg -e POSTGRES_PASSWORD=docker -e POSTGRES_USER=docker -d -p 5432:5432 postgres

