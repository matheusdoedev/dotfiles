#!/bin/sh
sudo pacman -Syu

sudo pacman -S docker docker-compose

sudo systemctl enable docker.service

sudo systemctl start docker.service

sudo groupadd docker

sudo usermod -aG docker $USER

sudo docker run -it --rm archlinux bash -c "echo hello world"

echo "We need to restart the system. Are you sure that you want to restart now? (Yes or No)"

read HAS_TO_RESTART_NOW

if [ $HAS_TO_RESTART_NOW -eq "Y" ] || [ $HAS_TO_RESTART_NOW -eq "YES" ] || [ $HAS_TO_RESTART_NOW -eq "yes"] || [ $HAS_TO_RESTART_NOW -eq "Yes" ]
then
	sudo reboot
fi
