#!/bin/zsh

docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=docker-d mysql:latest
