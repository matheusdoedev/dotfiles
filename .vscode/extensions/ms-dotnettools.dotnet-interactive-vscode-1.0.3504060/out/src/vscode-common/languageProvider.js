"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLanguageProviders = exports.SignatureHelpProvider = exports.HoverProvider = exports.CompletionItemProvider = void 0;
const vscode = require("vscode");
const completion_1 = require("./languageServices/completion");
const hover_1 = require("././languageServices/hover");
const interactiveNotebook_1 = require("./interactiveNotebook");
const vscodeUtilities_1 = require("./vscodeUtilities");
const diagnostics_1 = require("./diagnostics");
const signatureHelp_1 = require("./languageServices/signatureHelp");
const versionSpecificFunctions = require("../versionSpecificFunctions");
function getNotebookUriFromCellDocument(cellDocument) {
    const notebookDocument = vscode.workspace.notebookDocuments.find(notebook => notebook.getCells().some(cell => cell.document === cellDocument));
    if (notebookDocument) {
        return notebookDocument.uri;
    }
    return undefined;
}
class CompletionItemProvider {
    constructor(clientMapper, languageServiceDelay) {
        this.clientMapper = clientMapper;
        this.languageServiceDelay = languageServiceDelay;
    }
    provideCompletionItems(document, position, token, context) {
        const documentUri = getNotebookUriFromCellDocument(document);
        if (documentUri) {
            const documentText = document.getText();
            const completionPromise = (0, completion_1.provideCompletion)(this.clientMapper, (0, interactiveNotebook_1.getSimpleLanguage)(document.languageId), documentUri, documentText, position, this.languageServiceDelay);
            return ensureErrorsAreRejected(completionPromise, result => {
                let range = undefined;
                if (result.linePositionSpan) {
                    range = new vscode.Range(new vscode.Position(result.linePositionSpan.start.line, result.linePositionSpan.start.character), new vscode.Position(result.linePositionSpan.end.line, result.linePositionSpan.end.character));
                }
                const completionItems = [];
                for (const item of result.completions) {
                    const insertText = item.insertTextFormat === 'snippet' ? new vscode.SnippetString(item.insertText) : item.insertText;
                    const vscodeItem = {
                        label: item.displayText,
                        documentation: item.documentation,
                        filterText: item.filterText,
                        insertText: insertText,
                        sortText: item.sortText,
                        range: range,
                        kind: this.mapCompletionItem(item.kind)
                    };
                    completionItems.push(vscodeItem);
                }
                const completionList = new vscode.CompletionList(completionItems, false);
                return completionList;
            });
        }
    }
    mapCompletionItem(completionItemText) {
        // incomplete mapping from http://sourceroslyn.io/#Microsoft.CodeAnalysis.Workspaces/Tags/WellKnownTags.cs
        switch (completionItemText) {
            case "Class": return vscode.CompletionItemKind.Class;
            case "Constant": return vscode.CompletionItemKind.Constant;
            case "Delegate": return vscode.CompletionItemKind.Function;
            case "Enum": return vscode.CompletionItemKind.Enum;
            case "EnumMember": return vscode.CompletionItemKind.EnumMember;
            case "Event": return vscode.CompletionItemKind.Event;
            case "ExtensionMethod": return vscode.CompletionItemKind.Method;
            case "Field": return vscode.CompletionItemKind.Field;
            case "Interface": return vscode.CompletionItemKind.Interface;
            case "Local": return vscode.CompletionItemKind.Variable;
            case "Method": return vscode.CompletionItemKind.Method;
            case "Module": return vscode.CompletionItemKind.Module;
            case "Namespace": return vscode.CompletionItemKind.Module;
            case "Property": return vscode.CompletionItemKind.Property;
            case "Structure": return vscode.CompletionItemKind.Struct;
            case "Value": return vscode.CompletionItemKind.Value;
            default: return vscode.CompletionItemKind.Text; // what's an appropriate default?
        }
    }
}
exports.CompletionItemProvider = CompletionItemProvider;
CompletionItemProvider.triggerCharacters = ['.'];
class HoverProvider {
    constructor(clientMapper, languageServiceDelay) {
        this.clientMapper = clientMapper;
        this.languageServiceDelay = languageServiceDelay;
    }
    provideHover(document, position, token) {
        const documentUri = getNotebookUriFromCellDocument(document);
        if (documentUri) {
            const documentText = document.getText();
            const hoverPromise = (0, hover_1.provideHover)(this.clientMapper, (0, interactiveNotebook_1.getSimpleLanguage)(document.languageId), documentUri, documentText, position, this.languageServiceDelay);
            return ensureErrorsAreRejected(hoverPromise, result => {
                const contents = result.isMarkdown
                    ? new vscode.MarkdownString(result.contents)
                    : result.contents;
                const hover = new vscode.Hover(contents, (0, vscodeUtilities_1.convertToRange)(result.range));
                return hover;
            });
        }
    }
}
exports.HoverProvider = HoverProvider;
class SignatureHelpProvider {
    constructor(clientMapper, languageServiceDelay) {
        this.clientMapper = clientMapper;
        this.languageServiceDelay = languageServiceDelay;
    }
    provideSignatureHelp(document, position, token, context) {
        const documentUri = getNotebookUriFromCellDocument(document);
        if (documentUri) {
            const documentText = document.getText();
            const sigHelpPromise = (0, signatureHelp_1.provideSignatureHelp)(this.clientMapper, (0, interactiveNotebook_1.getSimpleLanguage)(document.languageId), documentUri, documentText, position, this.languageServiceDelay);
            return ensureErrorsAreRejected(sigHelpPromise, result => {
                const signatures = result.signatures.map(sig => {
                    const parameters = sig.parameters.map(p => new vscode.ParameterInformation(p.label, p.documentation.value));
                    let si = new vscode.SignatureInformation(sig.label, sig.documentation.value);
                    si.parameters = parameters;
                    return si;
                });
                let sh = new vscode.SignatureHelp();
                sh.signatures = signatures;
                sh.activeSignature = result.activeSignatureIndex;
                sh.activeParameter = result.activeParameterIndex;
                return sh;
            });
        }
    }
}
exports.SignatureHelpProvider = SignatureHelpProvider;
SignatureHelpProvider.triggerCharacters = ['(', ','];
function ensureErrorsAreRejected(promise, successHandler) {
    return new Promise((resolve, reject) => {
        promise.then(interimResult => {
            const finalResult = successHandler(interimResult);
            resolve(finalResult);
        }).catch(err => {
            reject(err);
        });
    });
}
function registerLanguageProviders(clientMapper, languageServiceDelay) {
    const disposables = [];
    let languages = [...interactiveNotebook_1.notebookCellLanguages, "dotnet-interactive.magic-commands"];
    disposables.push(vscode.languages.registerCompletionItemProvider(languages, new CompletionItemProvider(clientMapper, languageServiceDelay), ...CompletionItemProvider.triggerCharacters));
    disposables.push(vscode.languages.registerHoverProvider(languages, new HoverProvider(clientMapper, languageServiceDelay)));
    disposables.push(vscode.languages.registerSignatureHelpProvider(languages, new SignatureHelpProvider(clientMapper, languageServiceDelay), ...SignatureHelpProvider.triggerCharacters));
    disposables.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (vscode.languages.match(interactiveNotebook_1.notebookCellLanguages, e.document) &&
            vscode.window.activeNotebookEditor) {
            const cells = versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor).getCells();
            const cell = cells === null || cells === void 0 ? void 0 : cells.find(cell => cell.document === e.document);
            if (cell) {
                const documentUri = getNotebookUriFromCellDocument(e.document);
                if (documentUri) {
                    (0, interactiveNotebook_1.notebookCellChanged)(clientMapper, documentUri, e.document.getText(), (0, interactiveNotebook_1.getSimpleLanguage)(cell.document.languageId), languageServiceDelay, diagnostics => {
                        const collection = (0, diagnostics_1.getDiagnosticCollection)(e.document.uri);
                        collection.set(e.document.uri, diagnostics.map(vscodeUtilities_1.toVsCodeDiagnostic));
                    });
                }
            }
        }
    }));
    return vscode.Disposable.from(...disposables);
}
exports.registerLanguageProviders = registerLanguageProviders;
//# sourceMappingURL=languageProvider.js.map