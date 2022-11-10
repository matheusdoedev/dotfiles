"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.CompleteActionProvider = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const extract_to_folder_1 = require("./modules/extract-to-folder");
const template_parser_1 = require("./template-parser");
const editor_1 = require("./editor");
class CompleteActionProvider {
    provideCodeActions() {
        const text = editor_1.getSelectedText();
        // try parse text with parser
        if (text) {
            try {
                const output = template_parser_1.templateParser.parse(text);
                if (!output.errors) {
                    return [
                        {
                            command: 'extension.arrr.extract-to-folder',
                            title: 'Extract Angular Component',
                        },
                    ];
                }
            }
            catch (err) {
            }
        }
        return [];
    }
}
exports.CompleteActionProvider = CompleteActionProvider;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.arrr.extract-to-folder', extract_to_folder_1.extractToFolder));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ pattern: '**/*.*' }, new CompleteActionProvider()));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map