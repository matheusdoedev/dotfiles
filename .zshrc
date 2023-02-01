export ZSH="$HOME/.oh-my-zsh"
export JAVA_HOME="./.asdf/installs/java/openjdk-18.0.2.1"
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

ZSH_THEME="agnoster"

plugins=(git)

source $ZSH/oh-my-zsh.sh

# ASDF
. $HOME/.asdf/asdf.sh
fpath=(${ASDF_DIR}/completions $fpath)
autoload -Uz compinit && compinit

# ALIAS
alias gc="git commit"
alias gp="git pull"
alias gpo="git pull origin develop --no-rebase"
alias gpu="git push"
alias gpuf="git push --force"
alias gs="git stash"
alias gsp="git stash pop"
alias vim=nvim
alias vi=nvim
alias v=nvim
alias cleanconflicts="~/clean-conflict-branchs.sh"
# alias code="flatpak run com.visualstudio.code"


# Load Angular CLI autocompletion.
source <(ng completion script)
if [ $TILIX_ID ] || [ $VTE_VERSION ]; then
        source /etc/profile.d/vte.sh
fi
