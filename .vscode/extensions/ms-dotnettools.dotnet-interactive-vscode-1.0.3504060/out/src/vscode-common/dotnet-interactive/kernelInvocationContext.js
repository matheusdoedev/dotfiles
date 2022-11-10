"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.areCommandsTheSame = exports.KernelInvocationContext = void 0;
const rxjs = require("rxjs");
const connection_1 = require("./connection");
const contracts = require("./contracts");
const kernel_1 = require("./kernel");
const promiseCompletionSource_1 = require("./promiseCompletionSource");
class KernelInvocationContext {
    constructor(kernelCommandInvocation) {
        this._childCommands = [];
        this._eventSubject = new rxjs.Subject();
        this._isComplete = false;
        this._handlingKernel = null;
        this.completionSource = new promiseCompletionSource_1.PromiseCompletionSource();
        this._commandEnvelope = kernelCommandInvocation;
    }
    get promise() {
        return this.completionSource.promise;
    }
    get handlingKernel() {
        return this._handlingKernel;
    }
    ;
    get kernelEvents() {
        return this._eventSubject.asObservable();
    }
    ;
    set handlingKernel(value) {
        this._handlingKernel = value;
    }
    static establish(kernelCommandInvocation) {
        var _a, _b;
        let current = KernelInvocationContext._current;
        if (!current || current._isComplete) {
            KernelInvocationContext._current = new KernelInvocationContext(kernelCommandInvocation);
        }
        else {
            if (!areCommandsTheSame(kernelCommandInvocation, current._commandEnvelope)) {
                const found = current._childCommands.includes(kernelCommandInvocation);
                if (!found) {
                    current._childCommands.push(kernelCommandInvocation);
                    const oldSlip = (_a = kernelCommandInvocation.routingSlip) !== null && _a !== void 0 ? _a : [];
                    kernelCommandInvocation.routingSlip = [...((_b = current._commandEnvelope.routingSlip) !== null && _b !== void 0 ? _b : [])];
                    for (const uri of oldSlip) {
                        (0, connection_1.tryAddUriToRoutingSlip)(kernelCommandInvocation, uri);
                    }
                }
            }
        }
        return KernelInvocationContext._current;
    }
    static get current() { return this._current; }
    get command() { return this._commandEnvelope.command; }
    get commandEnvelope() { return this._commandEnvelope; }
    complete(command) {
        if (areCommandsTheSame(command, this._commandEnvelope)) {
            this._isComplete = true;
            let succeeded = {};
            let eventEnvelope = {
                command: this._commandEnvelope,
                eventType: contracts.CommandSucceededType,
                event: succeeded
            };
            this.internalPublish(eventEnvelope);
            this.completionSource.resolve();
            // TODO: C# version has completion callbacks - do we need these?
            // if (!_events.IsDisposed)
            // {
            //     _events.OnCompleted();
            // }
        }
        else {
            let pos = this._childCommands.indexOf(command);
            delete this._childCommands[pos];
        }
    }
    fail(message) {
        // TODO:
        // The C# code accepts a message and/or an exception. Do we need to add support
        // for exceptions? (The TS CommandFailed interface doesn't have a place for it right now.)
        this._isComplete = true;
        let failed = { message: message !== null && message !== void 0 ? message : "Command Failed" };
        let eventEnvelope = {
            command: this._commandEnvelope,
            eventType: contracts.CommandFailedType,
            event: failed
        };
        this.internalPublish(eventEnvelope);
        this.completionSource.resolve();
    }
    publish(kernelEvent) {
        if (!this._isComplete) {
            this.internalPublish(kernelEvent);
        }
    }
    internalPublish(kernelEvent) {
        if (!kernelEvent.command) {
            kernelEvent.command = this._commandEnvelope;
        }
        let command = kernelEvent.command;
        if (this.handlingKernel) {
            (0, connection_1.tryAddUriToRoutingSlip)(kernelEvent, (0, kernel_1.getKernelUri)(this.handlingKernel));
            kernelEvent.routingSlip; //?
        }
        else {
            kernelEvent; //?
        }
        this._commandEnvelope; //?
        if (command === null ||
            command === undefined ||
            areCommandsTheSame(command, this._commandEnvelope) ||
            this._childCommands.includes(command)) {
            this._eventSubject.next(kernelEvent);
        }
    }
    isParentOfCommand(commandEnvelope) {
        const childFound = this._childCommands.includes(commandEnvelope);
        return childFound;
    }
    dispose() {
        if (!this._isComplete) {
            this.complete(this._commandEnvelope);
        }
        KernelInvocationContext._current = null;
    }
}
exports.KernelInvocationContext = KernelInvocationContext;
KernelInvocationContext._current = null;
function areCommandsTheSame(envelope1, envelope2) {
    envelope1; //?
    envelope2; //?
    envelope1 === envelope2; //?
    return envelope1 === envelope2
        || ((envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.commandType) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.commandType) && (envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.token) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.token) && (envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.id) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.id));
}
exports.areCommandsTheSame = areCommandsTheSame;
//# sourceMappingURL=kernelInvocationContext.js.map