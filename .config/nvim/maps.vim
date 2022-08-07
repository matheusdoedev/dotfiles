" My mappings
nnoremap <silent> <C-s> <Cmd>w<CR>
inoremap <silent> <C-z> <Cmd>undo<CR>
inoremap <silent> <C-q> <Cmd>q<CR>

" LspSaga mappings
nnoremap <silent> <C-j> <Cmd>Lspsaga diagnostic_jump_next<CR>
inoremap <silent>	<S-k> <Cmd>Lspsaga hover_doc<CR>
nnoremap <silent> <C-k> <Cmd>Lspsaga signature_help<CR>
nnoremap <silent> <C-i> <Cmd>Lspsaga lsp_finder<CR>

" Telescope mappings
nnoremap <silent> <C-p> <cmd>Telescope find_files<cr>
nnoremap <silent> ;r <cmd>Telescope live_grep<cr>
nnoremap <silent> \\ <cmd>Telescope buffers<cr>
nnoremap <silent> <C-o> <cmd>Telescope help_tags<cr>

" Barbar mappings
nnoremap <silent>    <A-,> <Cmd>BufferPrevious<CR>
nnoremap <silent>    <A-.> <Cmd>BufferNext<CR>
nnoremap <silent>    <A-<> <Cmd>BufferMovePrevious<CR>
nnoremap <silent>    <A->> <Cmd>BufferMoveNext<CR>
nnoremap <silent>    <A-c> <Cmd>BufferClose<CR>
nnoremap <silent>    <A-1> <Cmd>BufferGoto 1<CR>
nnoremap <silent>    <A-0> <Cmd>BufferLast<CR>
