# ASDF
. $HOME/.asdf/asdf.sh
fpath=(${ASDF_DIR}/completions $fpath)
autoload -Uz compinit && compinit

# ALIAS
alias gc="git commit"
alias gp="git pull"
alias gpo="git pull origin develop --rebase"
alias gpu="git push"
alias gpuf="git push --force"
alias gs="git stash"
alias gsp="git stash pop"
alias nvim="~/.local/share/nvim/bin/nvim"
alias vim=nvim
alias vi=nvim
alias v=nvim


# Load Angular CLI autocompletion.
source <(ng completion script)