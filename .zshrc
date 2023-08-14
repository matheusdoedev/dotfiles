# Envs
export ZSH="$HOME/.oh-my-zsh"
export JAVA_HOME="$HOME/.asdf/installs/java/oracle-20"

# ZSH config
ZSH_THEME="amuse"
plugins=(git)
source $ZSH/oh-my-zsh.sh
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh

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
source <(ng completion script)

# Fixing TILIX bug
if [ $TILIX_ID ] || [ $VTE_VERSION ]; then
        source /etc/profile.d/vte.sh
fi
