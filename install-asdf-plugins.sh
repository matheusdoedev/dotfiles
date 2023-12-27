#!/bin/zsh
# This script installs asdf plugins (You need to close terminal after install asdf in order to run this script and install plugins).
# It will install only plugins of programming languages that I use. Feel free to install more after

# Install Node plugin
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
echo "Nodejs plugin installed!"

# Install Java plugin
asdf plugin-add java https://github.com/halcyon/asdf-java.git
echo "Java plugin installed!"

# Install Python plugin
asdf plugin-add python
echo "Python plugin installed!"

# Install .Net Core plugin
asdf plugin-add dotnet-core https://github.com/emersonsoares/asdf-dotnet-core.git
echo ".Net Core plugin installed!"

# Install Ruby plugin
asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git
echo "Ruby plugin installed!"

# Install Rust plugin
asdf plugin-add rust https://github.com/code-lever/asdf-rust.git
echo "Rust plugin installed"

# Install Elixir plugin
asdf plugin-add elixir https://github.com/asdf-vm/asdf-elixir.git
echo "Elixir plugin installed"

# Install PHP plugin
asdf plugin-add php https://github.com/asdf-community/asdf-php.git
echo "PHP plugin installed"
