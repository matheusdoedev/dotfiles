dnf install curl git &&
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2 &&
echo ". $HOME/.asdf/asdf.sh" >> ~/.zshrc