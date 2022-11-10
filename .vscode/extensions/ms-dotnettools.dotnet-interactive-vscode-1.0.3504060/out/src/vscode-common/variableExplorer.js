"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
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
exports.registerVariableExplorer = void 0;
const path = require("path");
const vscode = require("vscode");
const contracts = require("./dotnet-interactive/contracts");
const interactiveNotebook_1 = require("./interactiveNotebook");
const utilities = require("./utilities");
const versionSpecificFunctions = require("../versionSpecificFunctions");
const dotnet_interactive_1 = require("./dotnet-interactive");
// creates a map of, e.g.:
//   "dotnet-interactive.csharp" => "C# (.NET Interactive)""
const languageIdToAliasMap = new Map(vscode.extensions.all.map(e => { var _a, _b; return ((_b = (_a = e.packageJSON) === null || _a === void 0 ? void 0 : _a.contributes) === null || _b === void 0 ? void 0 : _b.languages) || []; })
    .filter(l => l)
    .reduce((a, b) => a.concat(b), [])
    .filter(l => { var _a, _b; return typeof l.id === 'string' && ((_b = (_a = l.aliases) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 && typeof l.aliases[0] === 'string'; })
    .map(l => [l.id, l.aliases[0]]));
function debounce(callback) {
    utilities.debounce('variable-explorer', 500, callback);
}
function registerVariableExplorer(context, clientMapper) {
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.shareValueTo', (variableInfo) => __awaiter(this, void 0, void 0, function* () {
        if (variableInfo && vscode.window.activeNotebookEditor) {
            const client = yield clientMapper.tryGetClient(versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor).uri);
            if (client) {
                // creates a map of _only_ the available languages in this notebook, e.g.:
                //   "C# (.NET Interactive)" => "dotnet-interactive.csharp"
                const availableKernelDisplayNamesToLanguageNames = new Map(client.kernel.childKernels.map(k => {
                    const notebookLanguage = (0, interactiveNotebook_1.getNotebookSpecificLanguage)(k.name);
                    let displayLanguage = notebookLanguage;
                    const displayLanguageCandidate = languageIdToAliasMap.get(notebookLanguage);
                    if (displayLanguageCandidate) {
                        displayLanguage = displayLanguageCandidate;
                    }
                    return [displayLanguage, k.name];
                }));
                const kernelDisplayValues = [...availableKernelDisplayNamesToLanguageNames.keys()];
                const selectedKernelName = yield vscode.window.showQuickPick(kernelDisplayValues, { title: `Share value [${variableInfo.valueName}] from [${variableInfo.kernelName}] to ...` });
                if (selectedKernelName) {
                    // translate back from display name (e.g., "C# (.NET Interactive)") to language name (e.g., "dotnet-interactive.csharp")
                    const targetKernelName = availableKernelDisplayNamesToLanguageNames.get(selectedKernelName);
                    // TODO: if not well-known kernel/language, add kernel selector, e.g., `#!sql-AdventureWorks`
                    // ends with newline to make adding code easier
                    const code = `#!share --from ${variableInfo.kernelName} ${variableInfo.valueName}\n`;
                    const command = {
                        language: targetKernelName,
                        code,
                    };
                    const commandEnvelope = {
                        commandType: contracts.SendEditableCodeType,
                        command,
                    };
                    yield client.kernel.rootKernel.send(commandEnvelope);
                }
            }
        }
    })));
    const webViewProvider = new WatchWindowTableViewProvider(clientMapper, context.extensionPath);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('dotnet-interactive-panel-values', webViewProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.clearValueExplorer', () => {
        webViewProvider.clearRows();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.resetValueExplorerSubscriptions', () => __awaiter(this, void 0, void 0, function* () {
        yield webViewProvider.refreshSubscriptions();
    })));
    vscode.window.onDidChangeActiveNotebookEditor((_editor) => __awaiter(this, void 0, void 0, function* () {
        // TODO: update on client process restart
        debounce(() => webViewProvider.refresh());
    }));
}
exports.registerVariableExplorer = registerVariableExplorer;
class WatchWindowTableViewProvider {
    constructor(clientMapper, extensionPath) {
        this.clientMapper = clientMapper;
        this.extensionPath = extensionPath;
        this.currentNotebookSubscription = undefined;
        this.webview = undefined;
    }
    resolveWebviewView(webviewView, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.webview = webviewView.webview;
            webviewView.webview.options = {
                enableScripts: true,
                enableCommandUris: true,
            };
            this.webview.onDidReceiveMessage(message => {
                const x = message;
            });
            // only load this once
            const apiFileUri = this.webview.asWebviewUri(vscode.Uri.file(path.join(this.extensionPath, 'resources', 'variableGrid.js')));
            const html = `
        <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body>
                <style>
                    table, th, td {
                        border-collapse: collapse;
                        border: 1px solid var(--vscode-quickInputList-focusBackground);
                    }
                    table {
                        width: 100%;
                    }
                    th {
                        color: var(--vscode-quickInputList-focusForeground);
                        background-color: var(--vscode-quickInputList-focusBackground);
                    }
                    td {
                        text-align: left;
                    }

                    input {
                        background-color: var(--vscode-settings-textInputBackground);
                        border: var(--vscode-settings-textInputBorder);
                        color: var(--vscode-settings-textInputForeground);
                    }
                    button {
                        background-color: var(--vscode-button-background);
                        border: var(--vscode-button-border);
                        color: var(--vscode-button-foreground);
                    }
                    button[hover] {
                        background-color: var(--vscode-button-hoverBackground);
                    }

                    .name-column {
                        width: 20%;
                    }
                    .value-column {
                    }
                    .kernel-column {
                        width: 20%;
                    }
                    .share-column {
                        width: 10%;
                    }

                    .share-data {
                        text-align: center;
                    }

                    .share-symbol {
                        padding: 2px;
                        height: 16px;
                        width: 16px;
                    }
                    .arrow {
                        fill: var(--vscode-settings-textInputForeground);
                    }
                    .arrow-box {
                        fill: var(--vscode-button-background);
                    }
                </style>
                <svg style="display: none">
                  <symbol id="share-icon" viewBox="0 0 16 16">
                    <title>Share to</title>
                    <g id="canvas">
                      <path d="M16,16H0V0H16Z" fill="none" opacity="0" />
                    </g>
                    <g id="level-1">
                      <path class="arrow" d="M10.5,9.5v-2a9.556,9.556,0,0,0-7,3c0-7,7-7,7-7v-2l4,4Z" opacity="0.1" />
                      <path class="arrow" d="M15.207,5.5,10,.293V3.032C8.322,3.2,3,4.223,3,10.5v1.371l.883-1.05A9.133,9.133,0,0,1,10,8.014v2.693ZM4.085,9.26C4.834,4.081,10.254,4,10.5,4L11,4V2.707L13.793,5.5,11,8.293V7h-.5A10.141,10.141,0,0,0,4.085,9.26Z" />
                      <path class="arrow-box" d="M12,10.121V15H0V4H1V14H11V11.121Z" />
                    </g>
                  </symbol>
                </svg>
                <script defer type="text/javascript" src="${apiFileUri.toString()}"></script>
                <label for="filter">Filter</label>
                <input id="filter" type="text" />
                <button id="clear">Clear</button>
                <div id="content"></div>
            </body>
        </html>
        `;
            this.webview.html = html;
            debounce(() => this.refresh());
        });
    }
    setRows(rows) {
        if (this.webview) {
            this.webview.postMessage({ command: 'set-rows', rows });
        }
    }
    clearRows() {
        this.setRows([]);
    }
    refreshSubscriptions() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.currentNotebookSubscription) === null || _a === void 0 ? void 0 : _a.dispose();
            this.currentNotebookSubscription = undefined;
            if (vscode.window.activeNotebookEditor) {
                const notebook = versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor);
                const client = yield this.clientMapper.getOrAddClient(notebook.uri);
                let sub = client.channel.receiver.subscribe({
                    next: (envelope) => {
                        var _a;
                        if ((0, dotnet_interactive_1.isKernelEventEnvelope)(envelope)) {
                            switch (envelope.eventType) {
                                case contracts.CommandSucceededType:
                                case contracts.CommandFailedType:
                                case contracts.CommandCancelledType:
                                    if (((_a = envelope.command) === null || _a === void 0 ? void 0 : _a.commandType) === contracts.SubmitCodeType) {
                                        debounce(() => this.refresh());
                                    }
                                    break;
                            }
                        }
                    }
                });
                this.currentNotebookSubscription = { dispose: () => sub.unsubscribe() };
            }
        });
    }
    refresh() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const rows = [];
            (_a = this.currentNotebookSubscription) === null || _a === void 0 ? void 0 : _a.dispose();
            this.currentNotebookSubscription = undefined;
            if (vscode.window.activeNotebookEditor) {
                const notebook = versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor);
                const client = yield this.clientMapper.getOrAddClient(notebook.uri);
                let sub = client.channel.receiver.subscribe({
                    next: (envelope) => {
                        var _a;
                        if ((0, dotnet_interactive_1.isKernelEventEnvelope)(envelope)) {
                            switch (envelope.eventType) {
                                case contracts.CommandSucceededType:
                                case contracts.CommandFailedType:
                                case contracts.CommandCancelledType:
                                    if (((_a = envelope.command) === null || _a === void 0 ? void 0 : _a.commandType) === contracts.SubmitCodeType) {
                                        debounce(() => this.refresh());
                                    }
                                    break;
                            }
                        }
                    }
                });
                this.currentNotebookSubscription = { dispose: () => sub.unsubscribe() };
                const kernelNames = Array.from(client.kernel.childKernels.filter(k => k.kernelInfo.supportedKernelCommands.find(ci => ci.name === contracts.RequestValueInfosType)).map(k => k.name));
                for (const name of kernelNames) {
                    try {
                        const valueInfos = yield client.requestValueInfos(name);
                        for (const valueInfo of valueInfos.valueInfos) {
                            try {
                                const value = yield client.requestValue(valueInfo.name, name);
                                const valueName = value.name;
                                const valueValue = value.formattedValue.value;
                                const commandUrl = `command:dotnet-interactive.shareValueTo?${encodeURIComponent(JSON.stringify({ valueName, kernelName: name }))}`;
                                rows.push({
                                    name: valueName,
                                    value: valueValue,
                                    kernel: `#!${name}`,
                                    link: commandUrl,
                                });
                            }
                            catch (e) {
                                // likely didn't support `RequestValue`
                                const x = e;
                            }
                        }
                    }
                    catch (e) {
                        // likely didn't support `RequestValueInfos`
                        const x = e;
                    }
                }
            }
            this.setRows(rows);
        });
    }
}
//# sourceMappingURL=variableExplorer.js.map