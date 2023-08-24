#!/bin/zsh
# Script made for Arch Linux based distributions and zsh

pacman -S curl git

git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.12.0

echo "\n. /opt/asdf-vm/asdf.sh" >> ~/.zshrc
