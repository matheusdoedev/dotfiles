"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeContentFromFileAtLineAndColumn = exports.gitIgnoreFolders = exports.prependTextToFile = exports.persistFileSystemChanges = exports.appendTextToFile = exports.replaceTextInFile = exports.subfoldersListOf = exports.createFileIfDoesntExist = void 0;
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const glob_1 = require("glob");
const gitignoreToGlob = require("gitignore-to-glob");
const editor_1 = require("./editor");
const vscode = require("vscode");
const vscode_1 = require("vscode");
function createFileIfDoesntExist(absolutePath) {
    let directoryToFile = path.dirname(absolutePath);
    if (!fs.existsSync(absolutePath)) {
        mkdirp.sync(directoryToFile);
        fs.appendFileSync(absolutePath, '');
    }
    return absolutePath;
}
exports.createFileIfDoesntExist = createFileIfDoesntExist;
function subfoldersListOf(root, ignoreList) {
    if (!root) {
        return [];
    }
    const results = glob_1.sync('**', { cwd: root, ignore: ignoreList })
        .filter((f) => fs.statSync(path.join(root, f)).isDirectory())
        .map((f) => '/' + f);
    return results;
}
exports.subfoldersListOf = subfoldersListOf;
exports.replaceTextInFile = (text, start, end, path) => (edit) => edit.replace(vscode_1.Uri.file(path), new vscode.Range(start, end), text);
function appendTextToFile(text, absolutePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const edit = new vscode.WorkspaceEdit();
        const linesInFile = yield countLineInFile(absolutePath);
        edit.insert(vscode_1.Uri.file(absolutePath), new vscode_1.Position(linesInFile, 0), text);
        return vscode.workspace.applyEdit(edit);
    });
}
exports.appendTextToFile = appendTextToFile;
function persistFileSystemChanges(...changes) {
    const accumulatedEdit = new vscode.WorkspaceEdit();
    changes.forEach((addChangeTo) => addChangeTo(accumulatedEdit));
    return vscode.workspace.applyEdit(accumulatedEdit);
}
exports.persistFileSystemChanges = persistFileSystemChanges;
function prependTextToFile(text, absolutePath) {
    const edit = new vscode.WorkspaceEdit();
    edit.insert(vscode_1.Uri.file(absolutePath), new vscode.Position(0, 0), text);
    return vscode.workspace.applyEdit(edit);
}
exports.prependTextToFile = prependTextToFile;
const invertGlob = (pattern) => pattern.replace(/^!/, '');
exports.gitIgnoreFolders = () => {
    const pathToLocalGitIgnore = editor_1.workspaceRoot() + '/.gitignore';
    return fs.existsSync(pathToLocalGitIgnore)
        ? gitignoreToGlob(pathToLocalGitIgnore).map(invertGlob)
        : [];
};
function removeContentFromFileAtLineAndColumn(start, end, path, replacement) {
    let edit = new vscode.WorkspaceEdit();
    edit.delete(editor_1.activeURI(), new vscode.Range(start, end));
    return vscode.workspace.applyEdit(edit);
}
exports.removeContentFromFileAtLineAndColumn = removeContentFromFileAtLineAndColumn;
function countLineInFile(file) {
    return new Promise((reoslve) => {
        let i;
        let count = 0;
        fs.createReadStream(file)
            .on('data', function (chunk) {
            for (i = 0; i < chunk.length; ++i) {
                if (chunk[i] === 10) {
                    count++;
                }
            }
        })
            .on('end', function () {
            reoslve(count);
        });
    });
}
//# sourceMappingURL=file-system.js.map