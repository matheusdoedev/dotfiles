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
exports.ProxyKernel = void 0;
const contracts = require("./contracts");
const logger_1 = require("./logger");
const kernel_1 = require("./kernel");
const connection = require("./connection");
const promiseCompletionSource_1 = require("./promiseCompletionSource");
class ProxyKernel extends kernel_1.Kernel {
    constructor(name, _sender, _receiver) {
        super(name);
        this.name = name;
        this._sender = _sender;
        this._receiver = _receiver;
        this.kernelType = kernel_1.KernelType.proxy;
    }
    getCommandHandler(commandType) {
        return {
            commandType,
            handle: (invocation) => {
                return this._commandHandler(invocation);
            }
        };
    }
    delegatePublication(envelope, invocationContext) {
        let alreadyBeenSeen = false;
        if (envelope.routingSlip === undefined || !envelope.routingSlip.find(e => e === (0, kernel_1.getKernelUri)(this))) {
            connection.tryAddUriToRoutingSlip(envelope, (0, kernel_1.getKernelUri)(this));
        }
        else {
            alreadyBeenSeen = true;
        }
        if (this.hasSameOrigin(envelope)) {
            if (!alreadyBeenSeen) {
                invocationContext.publish(envelope);
            }
        }
    }
    hasSameOrigin(envelope) {
        var _a, _b, _c;
        let commandOriginUri = (_c = (_b = (_a = envelope.command) === null || _a === void 0 ? void 0 : _a.command) === null || _b === void 0 ? void 0 : _b.originUri) !== null && _c !== void 0 ? _c : this.kernelInfo.uri;
        if (commandOriginUri === this.kernelInfo.uri) {
            return true;
        }
        return commandOriginUri === null;
    }
    updateKernelInfoFromEvent(kernelInfoProduced) {
        connection.updateKernelInfo(this.kernelInfo, kernelInfoProduced.kernelInfo);
    }
    _commandHandler(commandInvocation) {
        var _a, _b;
        var _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const commandToken = commandInvocation.commandEnvelope.token;
            const commandId = commandInvocation.commandEnvelope.id;
            const completionSource = new promiseCompletionSource_1.PromiseCompletionSource();
            // fix : is this the right way? We are trying to avoid forwarding events we just did forward
            let eventSubscription = this._receiver.subscribe({
                next: (envelope) => {
                    if (connection.isKernelEventEnvelope(envelope)) {
                        if (envelope.eventType === contracts.KernelInfoProducedType &&
                            (envelope.command === null || envelope.command === undefined)) {
                            const kernelInfoProduced = envelope.event;
                            this.updateKernelInfoFromEvent(kernelInfoProduced);
                            this.publishEvent({
                                eventType: contracts.KernelInfoProducedType,
                                event: { kernelInfo: this.kernelInfo }
                            });
                        }
                        else if (envelope.command.token === commandToken) {
                            for (const kernelUri of envelope.command.routingSlip) {
                                connection.tryAddUriToRoutingSlip(commandInvocation.commandEnvelope, kernelUri);
                                envelope.command.routingSlip = commandInvocation.commandEnvelope.routingSlip; //?
                            }
                            switch (envelope.eventType) {
                                case contracts.KernelInfoProducedType:
                                    {
                                        const kernelInfoProduced = envelope.event;
                                        if (kernelInfoProduced.kernelInfo.uri === this.kernelInfo.remoteUri) {
                                            this.updateKernelInfoFromEvent(kernelInfoProduced);
                                            this.delegatePublication({
                                                eventType: contracts.KernelInfoProducedType,
                                                event: { kernelInfo: this.kernelInfo },
                                                routingSlip: envelope.routingSlip,
                                                command: commandInvocation.commandEnvelope
                                            }, commandInvocation.context);
                                            this.delegatePublication(envelope, commandInvocation.context);
                                        }
                                        else {
                                            this.delegatePublication(envelope, commandInvocation.context);
                                        }
                                    }
                                    break;
                                case contracts.CommandCancelledType:
                                case contracts.CommandFailedType:
                                case contracts.CommandSucceededType:
                                    logger_1.Logger.default.info(`proxy name=${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] finished, envelopeid=${envelope.command.id}, commandid=${commandId}`);
                                    if (envelope.command.id === commandId) {
                                        completionSource.resolve(envelope);
                                    }
                                    else {
                                        this.delegatePublication(envelope, commandInvocation.context);
                                    }
                                    break;
                                default:
                                    this.delegatePublication(envelope, commandInvocation.context);
                                    break;
                            }
                        }
                    }
                }
            });
            try {
                if (!commandInvocation.commandEnvelope.command.destinationUri || !commandInvocation.commandEnvelope.command.originUri) {
                    (_a = (_c = commandInvocation.commandEnvelope.command).originUri) !== null && _a !== void 0 ? _a : (_c.originUri = this.kernelInfo.uri);
                    (_b = (_d = commandInvocation.commandEnvelope.command).destinationUri) !== null && _b !== void 0 ? _b : (_d.destinationUri = this.kernelInfo.remoteUri);
                }
                commandInvocation.commandEnvelope.routingSlip; //?
                logger_1.Logger.default.info(`proxy ${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] forwarding command ${commandInvocation.commandEnvelope.commandType} to ${commandInvocation.commandEnvelope.command.destinationUri}`);
                this._sender.send(commandInvocation.commandEnvelope);
                logger_1.Logger.default.info(`proxy ${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] about to await with token ${commandToken}`);
                const enventEnvelope = yield completionSource.promise;
                if (enventEnvelope.eventType === contracts.CommandFailedType) {
                    commandInvocation.context.fail(enventEnvelope.event.message);
                }
                logger_1.Logger.default.info(`proxy ${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] done awaiting with token ${commandToken}`);
            }
            catch (e) {
                commandInvocation.context.fail(e.message);
            }
            finally {
                eventSubscription.unsubscribe();
            }
        });
    }
}
exports.ProxyKernel = ProxyKernel;
//# sourceMappingURL=proxyKernel.js.map