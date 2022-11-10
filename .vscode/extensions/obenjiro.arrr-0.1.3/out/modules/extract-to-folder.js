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
exports.extractToFolder = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const editor_1 = require("../editor");
const template_parser_1 = require("../template-parser");
const file_picker_1 = require("../file-picker");
const file_system_1 = require("../file-system");
const change_case_1 = require("change-case");
const code_actions_1 = require("../code-actions");
const directories_picker_1 = require("../directories-picker");
const extract_to_folder_template_1 = require("./extract-to-folder-template");
function extractToFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, end } = editor_1.getSelectionOffsetRange();
        if (start && end) {
            try {
                const text = editor_1.getSelectedText() || "";
                const componentText = yield getComponentTextFromHtmlFileName(editor_1.activeFileName());
                const targets = template_parser_1.getAllTargets(text);
                const sourceComponentConfig = yield getCurrentComponentConfig(componentText);
                try {
                    const rootPath = editor_1.workspaceRoot();
                    const folderPath = yield directories_picker_1.showDirectoryPicker();
                    const fileName = (yield file_picker_1.showFilePicker());
                    let fullPath;
                    if (folderPath.indexOf(rootPath) > -1) {
                        fullPath = path.join(folderPath, fileName);
                    }
                    else {
                        fullPath = path.join(rootPath || '', folderPath, fileName);
                    }
                    const htmlFilePath = `${fullPath}/${fileName}.component.html`;
                    const cssFilePath = `${fullPath}/${fileName}.component.${sourceComponentConfig.styleExt}`;
                    const tsFilePath = `${fullPath}/${fileName}.component.ts`;
                    const specFilePath = `${fullPath}/${fileName}.component.spec.ts`;
                    yield file_system_1.createFileIfDoesntExist(htmlFilePath);
                    yield file_system_1.createFileIfDoesntExist(cssFilePath);
                    yield file_system_1.createFileIfDoesntExist(tsFilePath);
                    yield file_system_1.createFileIfDoesntExist(specFilePath);
                    yield code_actions_1.appendSelectedTextToFile({ text }, htmlFilePath);
                    yield code_actions_1.appendSelectedTextToFile({ text: `` }, cssFilePath);
                    yield code_actions_1.appendSelectedTextToFile({ text: extract_to_folder_template_1.getComponentText(fileName, targets, sourceComponentConfig) }, tsFilePath);
                    yield code_actions_1.appendSelectedTextToFile({ text: extract_to_folder_template_1.getSpecText(fileName) }, specFilePath);
                    const componentInstance = extract_to_folder_template_1.getComponentInstance(fileName, targets);
                    yield file_system_1.persistFileSystemChanges(code_actions_1.replaceSelectionWith(componentInstance));
                    const moduleUris = yield vscode.workspace.findFiles("**/*.module.ts", "**/node_modules/**");
                    const moduleDocuments = yield Promise.all(moduleUris.map((uri) => vscode.workspace.openTextDocument(uri)));
                    const targetModuleDocuments = moduleDocuments.filter((moduleDocument) => {
                        const allText = moduleDocument.getText();
                        return new RegExp(`\\b${sourceComponentConfig.componentName}\\b`).test(allText);
                    });
                    const changes = yield Promise.all(targetModuleDocuments.map((moduleDocument) => {
                        const allText = moduleDocument.getText();
                        const matches = allText.match(/declarations\s*:\s*\[/) || [];
                        const idx = matches.index || 0;
                        const startOffset = idx;
                        const endOffset = idx + matches[0].length;
                        const start = moduleDocument.positionAt(startOffset);
                        const end = moduleDocument.positionAt(endOffset);
                        const targetText = `${matches[0]}\n    ${change_case_1.pascalCase(fileName)}Component,`;
                        return file_system_1.replaceTextInFile(targetText, start, end, moduleDocument.fileName);
                    }));
                    yield file_system_1.persistFileSystemChanges(...changes);
                    yield Promise.all(targetModuleDocuments.map((moduleDocument) => {
                        return editor_1.importMissingDependencies(moduleDocument.fileName);
                    }));
                }
                catch (e) {
                    vscode.window.showErrorMessage(e.message);
                }
            }
            catch (err) {
                console.error(err);
            }
        }
    });
}
exports.extractToFolder = extractToFolder;
function getComponentTextFromHtmlFileName(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = path.basename(filePath);
        const dir = path.dirname(filePath);
        const tsPath = path.join(dir, name.replace(".html", ".ts"));
        const tsContent = fs.readFileSync(tsPath, "utf-8");
        return tsContent;
    });
}
function getCurrentComponentConfig(componentText) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ts = require('typescript');
            const node = ts.createSourceFile('x.ts', componentText, ts.ScriptTarget.Latest // langugeVersion
            );
            let classDecl;
            node.forEachChild(child => {
                if (ts.SyntaxKind[child.kind] === 'ClassDeclaration' &&
                    child.decorators[0].expression.expression.escapedText === 'Component') {
                    classDecl = child;
                }
            });
            // const decoratorName = classDecl.decorators[0].expression.expression.escapedText;
            const decoratorParams = classDecl.decorators[0].expression.arguments.reduce((acc, el) => {
                el.properties.forEach(prop => acc[prop.name.escapedText] = prop.initializer.elements ? prop.initializer.elements.map(e => e.text) : prop.initializer.text);
                return acc;
            }, {});
            const styleInline = Boolean(decoratorParams.style);
            return {
                componentName: classDecl.name.escapedText,
                styleInline,
                styleExt: styleInline ? 'css' : trimChar(path.extname(decoratorParams.styleUrls[0] || 'fail.css'), '.')
            };
        }
        catch (e) {
            return {
                componentName: (componentText.match(/export class\s+([\w_]+)/) || [])[1],
                styleInline: false,
                styleExt: 'css'
            };
        }
    });
}
function escapeRegExp(strToEscape) {
    // Escape special characters for use in a regular expression
    return strToEscape.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
;
function trimChar(origString, charToTrim) {
    charToTrim = escapeRegExp(charToTrim);
    var regEx = new RegExp("^[" + charToTrim + "]+|[" + charToTrim + "]+$", "g");
    return origString.replace(regEx, "");
}
;
//# sourceMappingURL=extract-to-folder.js.map