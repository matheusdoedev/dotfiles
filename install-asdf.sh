#!/bin/zsh
# Script made for Arch Linux based distributions and zsh

echo "Checking if curl and git is installed"
pacman -S curl git

echo "Downloading asdf repository"
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.12.0

echo "\n. /opt/asdf-vm/asdf.sh" >> ~/.zshrc
echo "asdf installed."
