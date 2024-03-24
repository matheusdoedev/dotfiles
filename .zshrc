# Envs
export ZSH="$HOME/.oh-my-zsh"
export JAVA_HOME="$HOME/.asdf/installs/java/openjdk-17.0.2"
export M2_HOME="$HOME/.asdf/installs/maven/3.9.6"
export PATH="$JAVA_HOME/bin:$M2_HOME/bin:$PATH"

# ZSH config
ZSH_THEME="amuse"
plugins=(
	git
	zsh-autosuggestions
)
source $ZSH/oh-my-zsh.sh

# ASDF config
. $HOME/.asdf/asdf.sh
fpath=(${ASDF_DIR}/completions $fpath)
autoload -Uz compinit && compinit

# ALIAS
alias gc="git commit"
alias gpull="git pull"
alias gpullo="git pull origin develop --no-rebase"
alias gpush="git push"
alias gpushf="git push --force"
alias gs="git stash"
alias gsp="git stash pop"
alias lvim="~/.local/bin/lvim"
alias vim=nvim
alias vi=nvim
alias v=nvim

# Load Angular CLI autocompletion.
if [ ng ]; then
	source <(ng completion script)
fi

# Fixing TILIX bug
if [ $TILIX_ID ] || [ $VTE_VERSION ]; then
        source /etc/profile.d/vte.sh
fi
