"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showFilePicker = exports.promptFileNameInput = void 0;
const editor_1 = require("./editor");
const vscode = require("vscode");
function promptFileNameInput(directory) {
    return editor_1.showInputBox(directory, 'Filename or relative path to a file').then(editor_1.convertRelativeToFullPath);
}
exports.promptFileNameInput = promptFileNameInput;
const NEW_FILE_OPTION = 'Enter Folder Name';
function showFilePicker() {
    return (vscode.window
        .showInputBox({
        placeHolder: NEW_FILE_OPTION
    })
        .then(cancelActionIfNeeded));
}
exports.showFilePicker = showFilePicker;
const cancelActionIfNeeded = (value) => value ? value : Promise.reject(false);
//# sourceMappingURL=file-picker.js.map