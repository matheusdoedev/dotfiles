docker run -d -p 15691:15691 -p 15692:15692 -p 25672:25672 -p 4369:4369 -p 5671:5671 -p 5672:5672 --hostname my-rabbit --name rabbitmq rabbitmq:3 &&
docker run -d -p 15671:15671 -p 15672:15672 --hostname my-rabbit --name rabbitmq-admin -e RABBITMQ_DEFAULT_USER=docker -e RABBITMQ_DEFAULT_PASS=docker rabbitmq:3-management
