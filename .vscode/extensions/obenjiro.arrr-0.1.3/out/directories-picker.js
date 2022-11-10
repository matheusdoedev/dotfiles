"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showDirectoryPicker = void 0;
const editor_1 = require("./editor");
const file_system_1 = require("./file-system");
function getWorkspaceFolderStructure() {
    return new Promise((resolveWith, reject) => {
        const findDirectories = () => {
            try {
                resolveWith(file_system_1.subfoldersListOf(editor_1.workspaceRoot(), file_system_1.gitIgnoreFolders()));
            }
            catch (error) {
                reject(error);
            }
        };
        const delayToAllowVSCodeToRender = 1;
        setTimeout(findDirectories, delayToAllowVSCodeToRender);
    });
}
const prependQuickpickForCurrentFileFolder = (quickPicksList) => {
    return [
        editor_1.toQuickPick(editor_1.currentEditorPath(), 'current file directory'),
        ...quickPicksList,
    ];
};
const getQuickPicksForWorkspaceFolderStructure = () => {
    if (!editor_1.workspaceRoot()) {
        return Promise.resolve([]);
    }
    return getWorkspaceFolderStructure().then(editor_1.toQuickPicksList);
};
function showDirectoryPicker() {
    return getQuickPicksForWorkspaceFolderStructure()
        .then(prependQuickpickForCurrentFileFolder)
        .then((choices) => editor_1.showQuickPicksList(choices, 'Pick directory that contains the file'))
        .then(editor_1.extractQuickPickValue)
        .then(cancelActionIfNeeded);
}
exports.showDirectoryPicker = showDirectoryPicker;
const cancelActionIfNeeded = (value) => value ? value : Promise.reject(false);
//# sourceMappingURL=directories-picker.js.map