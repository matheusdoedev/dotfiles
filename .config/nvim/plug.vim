call plug#begin(stdpath('data') . '/plugged')
	
	Plug 'wakatime/vim-wakatime'
	Plug 'tpope/vim-fugitive'
	Plug 'tpope/vim-rhubarb'
	Plug 'cohama/lexima.vim'
	Plug 'prabirshrestha/vim-lsp'
	Plug 'mattn/vim-lsp-settings'

if has("nvim")
	
	Plug 'olimorris/onedarkpro.nvim'
	Plug 'neovim/nvim-lspconfig'
	Plug 'glepnir/lspsaga.nvim'
	Plug 'nvim-lua/completion-nvim'
	Plug 'nvim-telescope/telescope.nvim'
	Plug 'nvim-treesitter/nvim-treesitter'
	Plug 'nvim-lua/completion-nvim'
	Plug 'nvim-lua/popup.nvim'
	Plug 'nvim-lua/plenary.nvim'
	Plug 'nvim-telescope/telescope.nvim'
	Plug 'kyazdani42/nvim-web-devicons'
	Plug 'hoob3rt/lualine.nvim'
	Plug 'romgrk/barbar.nvim'

endif

call plug#end()
