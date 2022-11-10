"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importMissingDependencies = exports.showErrorMessage = exports.toQuickPicksList = exports.toQuickPick = exports.extractQuickPickValue = exports.convertRelativeToFullPath = exports.showQuickPicksList = exports.showInputBox = exports.getSelectionOffsetRange = exports.getSelectedText = exports.openFile = exports.currentEditorPath = exports.config = exports.selectedTextEnd = exports.selectedTextStart = exports.activeFileName = exports.activeURI = exports.workspaceRoot = void 0;
const vscode = require("vscode");
const path = require("path");
exports.workspaceRoot = () => vscode.workspace.rootPath;
exports.activeURI = () => { var _a; return (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri; };
exports.activeFileName = () => { var _a; return (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.fileName; };
exports.selectedTextStart = () => { var _a; return (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.selection.start; };
exports.selectedTextEnd = () => { var _a; return (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.selection.end; };
exports.config = () => vscode.workspace.getConfiguration('arrr');
function currentEditorPath() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const currentFilePath = path.dirname(activeEditor.document.fileName);
        const rootMatcher = new RegExp(`^${exports.workspaceRoot()}`);
        return currentFilePath.replace(rootMatcher, '');
    }
    return '';
}
exports.currentEditorPath = currentEditorPath;
function openFile(absolutePath) {
    return vscode.workspace
        .openTextDocument(absolutePath)
        .then((textDocument) => {
        if (textDocument) {
            vscode.window.showTextDocument(textDocument);
            return absolutePath;
        }
        else {
            throw Error('Could not open document');
        }
    });
}
exports.openFile = openFile;
function getSelectedText() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        return editor.document.getText(selection);
    }
    else {
        return null;
    }
}
exports.getSelectedText = getSelectedText;
function getSelectionOffsetRange() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        return {
            start: editor.document.offsetAt(editor.selection.start),
            end: editor.document.offsetAt(editor.selection.end),
        };
    }
    else {
        return {};
    }
}
exports.getSelectionOffsetRange = getSelectionOffsetRange;
function showInputBox(defaultValue, placeHolder) {
    return vscode.window.showInputBox({
        value: defaultValue,
        placeHolder,
    });
}
exports.showInputBox = showInputBox;
function showQuickPicksList(choices, placeHolder = '') {
    // return vscode.window.showInputBox();
    return vscode.window.showQuickPick(choices, {
        placeHolder,
    });
}
exports.showQuickPicksList = showQuickPicksList;
exports.convertRelativeToFullPath = (relativePath) => {
    const root = exports.workspaceRoot();
    return root ? path.join(root, relativePath) : relativePath;
};
exports.extractQuickPickValue = (selection) => {
    if (!selection) {
        return;
    }
    return selection.label;
};
exports.toQuickPick = (label, description) => ({
    label,
    description,
});
exports.toQuickPicksList = (choices) => choices.map((item) => exports.toQuickPick(item));
exports.showErrorMessage = (message) => vscode.window.showErrorMessage(message);
exports.importMissingDependencies = (targetFile) => vscode.commands.executeCommand('_typescript.applyFixAllCodeAction', targetFile, { fixId: 'fixMissingImport' });
//# sourceMappingURL=editor.js.map