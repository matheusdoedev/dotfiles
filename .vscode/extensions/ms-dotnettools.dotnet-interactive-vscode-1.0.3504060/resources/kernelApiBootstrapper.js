(function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function createErrorClass(createImpl) {
        var _super = function (instance) {
            Error.call(instance);
            instance.stack = new Error().stack;
        };
        var ctorFunc = createImpl(_super);
        ctorFunc.prototype = Object.create(Error.prototype);
        ctorFunc.prototype.constructor = ctorFunc;
        return ctorFunc;
    }

    var UnsubscriptionError = createErrorClass(function (_super) {
        return function UnsubscriptionErrorImpl(errors) {
            _super(this);
            this.message = errors
                ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
                : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
        };
    });

    function arrRemove(arr, item) {
        if (arr) {
            var index = arr.indexOf(item);
            0 <= index && arr.splice(index, 1);
        }
    }

    var Subscription = (function () {
        function Subscription(initialTeardown) {
            this.initialTeardown = initialTeardown;
            this.closed = false;
            this._parentage = null;
            this._finalizers = null;
        }
        Subscription.prototype.unsubscribe = function () {
            var e_1, _a, e_2, _b;
            var errors;
            if (!this.closed) {
                this.closed = true;
                var _parentage = this._parentage;
                if (_parentage) {
                    this._parentage = null;
                    if (Array.isArray(_parentage)) {
                        try {
                            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                                var parent_1 = _parentage_1_1.value;
                                parent_1.remove(this);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    else {
                        _parentage.remove(this);
                    }
                }
                var initialFinalizer = this.initialTeardown;
                if (isFunction(initialFinalizer)) {
                    try {
                        initialFinalizer();
                    }
                    catch (e) {
                        errors = e instanceof UnsubscriptionError ? e.errors : [e];
                    }
                }
                var _finalizers = this._finalizers;
                if (_finalizers) {
                    this._finalizers = null;
                    try {
                        for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                            var finalizer = _finalizers_1_1.value;
                            try {
                                execFinalizer(finalizer);
                            }
                            catch (err) {
                                errors = errors !== null && errors !== void 0 ? errors : [];
                                if (err instanceof UnsubscriptionError) {
                                    errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                                }
                                else {
                                    errors.push(err);
                                }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                if (errors) {
                    throw new UnsubscriptionError(errors);
                }
            }
        };
        Subscription.prototype.add = function (teardown) {
            var _a;
            if (teardown && teardown !== this) {
                if (this.closed) {
                    execFinalizer(teardown);
                }
                else {
                    if (teardown instanceof Subscription) {
                        if (teardown.closed || teardown._hasParent(this)) {
                            return;
                        }
                        teardown._addParent(this);
                    }
                    (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
                }
            }
        };
        Subscription.prototype._hasParent = function (parent) {
            var _parentage = this._parentage;
            return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
        };
        Subscription.prototype._addParent = function (parent) {
            var _parentage = this._parentage;
            this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
        };
        Subscription.prototype._removeParent = function (parent) {
            var _parentage = this._parentage;
            if (_parentage === parent) {
                this._parentage = null;
            }
            else if (Array.isArray(_parentage)) {
                arrRemove(_parentage, parent);
            }
        };
        Subscription.prototype.remove = function (teardown) {
            var _finalizers = this._finalizers;
            _finalizers && arrRemove(_finalizers, teardown);
            if (teardown instanceof Subscription) {
                teardown._removeParent(this);
            }
        };
        Subscription.EMPTY = (function () {
            var empty = new Subscription();
            empty.closed = true;
            return empty;
        })();
        return Subscription;
    }());
    var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
    function isSubscription(value) {
        return (value instanceof Subscription ||
            (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
    }
    function execFinalizer(finalizer) {
        if (isFunction(finalizer)) {
            finalizer();
        }
        else {
            finalizer.unsubscribe();
        }
    }

    var config = {
        onUnhandledError: null,
        onStoppedNotification: null,
        Promise: undefined,
        useDeprecatedSynchronousErrorHandling: false,
        useDeprecatedNextContext: false,
    };

    var timeoutProvider = {
        setTimeout: function (handler, timeout) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var delegate = timeoutProvider.delegate;
            if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
                return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
            }
            return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
        },
        clearTimeout: function (handle) {
            var delegate = timeoutProvider.delegate;
            return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
        },
        delegate: undefined,
    };

    function reportUnhandledError(err) {
        timeoutProvider.setTimeout(function () {
            {
                throw err;
            }
        });
    }

    function noop() { }

    var context = null;
    function errorContext(cb) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            var isRoot = !context;
            if (isRoot) {
                context = { errorThrown: false, error: null };
            }
            cb();
            if (isRoot) {
                var _a = context, errorThrown = _a.errorThrown, error = _a.error;
                context = null;
                if (errorThrown) {
                    throw error;
                }
            }
        }
        else {
            cb();
        }
    }

    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destination) {
            var _this = _super.call(this) || this;
            _this.isStopped = false;
            if (destination) {
                _this.destination = destination;
                if (isSubscription(destination)) {
                    destination.add(_this);
                }
            }
            else {
                _this.destination = EMPTY_OBSERVER;
            }
            return _this;
        }
        Subscriber.create = function (next, error, complete) {
            return new SafeSubscriber(next, error, complete);
        };
        Subscriber.prototype.next = function (value) {
            if (this.isStopped) ;
            else {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (!this.closed) {
                this.isStopped = true;
                _super.prototype.unsubscribe.call(this);
                this.destination = null;
            }
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            try {
                this.destination.error(err);
            }
            finally {
                this.unsubscribe();
            }
        };
        Subscriber.prototype._complete = function () {
            try {
                this.destination.complete();
            }
            finally {
                this.unsubscribe();
            }
        };
        return Subscriber;
    }(Subscription));
    var _bind = Function.prototype.bind;
    function bind(fn, thisArg) {
        return _bind.call(fn, thisArg);
    }
    var ConsumerObserver = (function () {
        function ConsumerObserver(partialObserver) {
            this.partialObserver = partialObserver;
        }
        ConsumerObserver.prototype.next = function (value) {
            var partialObserver = this.partialObserver;
            if (partialObserver.next) {
                try {
                    partialObserver.next(value);
                }
                catch (error) {
                    handleUnhandledError(error);
                }
            }
        };
        ConsumerObserver.prototype.error = function (err) {
            var partialObserver = this.partialObserver;
            if (partialObserver.error) {
                try {
                    partialObserver.error(err);
                }
                catch (error) {
                    handleUnhandledError(error);
                }
            }
            else {
                handleUnhandledError(err);
            }
        };
        ConsumerObserver.prototype.complete = function () {
            var partialObserver = this.partialObserver;
            if (partialObserver.complete) {
                try {
                    partialObserver.complete();
                }
                catch (error) {
                    handleUnhandledError(error);
                }
            }
        };
        return ConsumerObserver;
    }());
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            var partialObserver;
            if (isFunction(observerOrNext) || !observerOrNext) {
                partialObserver = {
                    next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                    error: error !== null && error !== void 0 ? error : undefined,
                    complete: complete !== null && complete !== void 0 ? complete : undefined,
                };
            }
            else {
                var context_1;
                if (_this && config.useDeprecatedNextContext) {
                    context_1 = Object.create(observerOrNext);
                    context_1.unsubscribe = function () { return _this.unsubscribe(); };
                    partialObserver = {
                        next: observerOrNext.next && bind(observerOrNext.next, context_1),
                        error: observerOrNext.error && bind(observerOrNext.error, context_1),
                        complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                    };
                }
                else {
                    partialObserver = observerOrNext;
                }
            }
            _this.destination = new ConsumerObserver(partialObserver);
            return _this;
        }
        return SafeSubscriber;
    }(Subscriber));
    function handleUnhandledError(error) {
        {
            reportUnhandledError(error);
        }
    }
    function defaultErrorHandler(err) {
        throw err;
    }
    var EMPTY_OBSERVER = {
        closed: true,
        next: noop,
        error: defaultErrorHandler,
        complete: noop,
    };

    var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

    function identity(x) {
        return x;
    }

    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    var Observable = (function () {
        function Observable(subscribe) {
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var _this = this;
            var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
            errorContext(function () {
                var _a = _this, operator = _a.operator, source = _a.source;
                subscriber.add(operator
                    ?
                        operator.call(subscriber, source)
                    : source
                        ?
                            _this._subscribe(subscriber)
                        :
                            _this._trySubscribe(subscriber));
            });
            return subscriber;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                sink.error(err);
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscriber = new SafeSubscriber({
                    next: function (value) {
                        try {
                            next(value);
                        }
                        catch (err) {
                            reject(err);
                            subscriber.unsubscribe();
                        }
                    },
                    error: reject,
                    complete: resolve,
                });
                _this.subscribe(subscriber);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var _a;
            return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        var _a;
        return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
    }
    function isObserver(value) {
        return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
    }
    function isSubscriber(value) {
        return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
    }

    function hasLift(source) {
        return isFunction(source === null || source === void 0 ? void 0 : source.lift);
    }
    function operate(init) {
        return function (source) {
            if (hasLift(source)) {
                return source.lift(function (liftedSource) {
                    try {
                        return init(liftedSource, this);
                    }
                    catch (err) {
                        this.error(err);
                    }
                });
            }
            throw new TypeError('Unable to lift unknown Observable type');
        };
    }

    function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
        return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
    }
    var OperatorSubscriber = (function (_super) {
        __extends(OperatorSubscriber, _super);
        function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
            var _this = _super.call(this, destination) || this;
            _this.onFinalize = onFinalize;
            _this.shouldUnsubscribe = shouldUnsubscribe;
            _this._next = onNext
                ? function (value) {
                    try {
                        onNext(value);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                }
                : _super.prototype._next;
            _this._error = onError
                ? function (err) {
                    try {
                        onError(err);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._error;
            _this._complete = onComplete
                ? function () {
                    try {
                        onComplete();
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._complete;
            return _this;
        }
        OperatorSubscriber.prototype.unsubscribe = function () {
            var _a;
            if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
                var closed_1 = this.closed;
                _super.prototype.unsubscribe.call(this);
                !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
            }
        };
        return OperatorSubscriber;
    }(Subscriber));

    var ObjectUnsubscribedError = createErrorClass(function (_super) {
        return function ObjectUnsubscribedErrorImpl() {
            _super(this);
            this.name = 'ObjectUnsubscribedError';
            this.message = 'object unsubscribed';
        };
    });

    var Subject = (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.closed = false;
            _this.currentObservers = null;
            _this.observers = [];
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype._throwIfClosed = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
        };
        Subject.prototype.next = function (value) {
            var _this = this;
            errorContext(function () {
                var e_1, _a;
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    if (!_this.currentObservers) {
                        _this.currentObservers = Array.from(_this.observers);
                    }
                    try {
                        for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var observer = _c.value;
                            observer.next(value);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
        };
        Subject.prototype.error = function (err) {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.hasError = _this.isStopped = true;
                    _this.thrownError = err;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().error(err);
                    }
                }
            });
        };
        Subject.prototype.complete = function () {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.isStopped = true;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().complete();
                    }
                }
            });
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = this.closed = true;
            this.observers = this.currentObservers = null;
        };
        Object.defineProperty(Subject.prototype, "observed", {
            get: function () {
                var _a;
                return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
            },
            enumerable: false,
            configurable: true
        });
        Subject.prototype._trySubscribe = function (subscriber) {
            this._throwIfClosed();
            return _super.prototype._trySubscribe.call(this, subscriber);
        };
        Subject.prototype._subscribe = function (subscriber) {
            this._throwIfClosed();
            this._checkFinalizedStatuses(subscriber);
            return this._innerSubscribe(subscriber);
        };
        Subject.prototype._innerSubscribe = function (subscriber) {
            var _this = this;
            var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
            if (hasError || isStopped) {
                return EMPTY_SUBSCRIPTION;
            }
            this.currentObservers = null;
            observers.push(subscriber);
            return new Subscription(function () {
                _this.currentObservers = null;
                arrRemove(observers, subscriber);
            });
        };
        Subject.prototype._checkFinalizedStatuses = function (subscriber) {
            var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
            if (hasError) {
                subscriber.error(thrownError);
            }
            else if (isStopped) {
                subscriber.complete();
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
        };
        AnonymousSubject.prototype.error = function (err) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
        };
        AnonymousSubject.prototype.complete = function () {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var _a, _b;
            return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
        };
        return AnonymousSubject;
    }(Subject));

    function map(project, thisArg) {
        return operate(function (source, subscriber) {
            var index = 0;
            source.subscribe(createOperatorSubscriber(subscriber, function (value) {
                subscriber.next(project.call(thisArg, value, index++));
            }));
        });
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    const RequestKernelInfoType = "RequestKernelInfo";
    const RequestValueType = "RequestValue";
    const RequestValueInfosType = "RequestValueInfos";
    const SubmitCodeType = "SubmitCode";
    const CodeSubmissionReceivedType = "CodeSubmissionReceived";
    const CommandCancelledType = "CommandCancelled";
    const CommandFailedType = "CommandFailed";
    const CommandSucceededType = "CommandSucceeded";
    const DisplayedValueProducedType = "DisplayedValueProduced";
    const KernelInfoProducedType = "KernelInfoProduced";
    const KernelReadyType = "KernelReady";
    const ReturnValueProducedType = "ReturnValueProduced";
    const ValueInfosProducedType = "ValueInfosProduced";
    const ValueProducedType = "ValueProduced";
    var InsertTextFormat;
    (function (InsertTextFormat) {
        InsertTextFormat["PlainText"] = "plaintext";
        InsertTextFormat["Snippet"] = "snippet";
    })(InsertTextFormat || (InsertTextFormat = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        DiagnosticSeverity["Hidden"] = "hidden";
        DiagnosticSeverity["Info"] = "info";
        DiagnosticSeverity["Warning"] = "warning";
        DiagnosticSeverity["Error"] = "error";
    })(DiagnosticSeverity || (DiagnosticSeverity = {}));
    var DocumentSerializationType;
    (function (DocumentSerializationType) {
        DocumentSerializationType["Dib"] = "dib";
        DocumentSerializationType["Ipynb"] = "ipynb";
    })(DocumentSerializationType || (DocumentSerializationType = {}));
    var RequestType;
    (function (RequestType) {
        RequestType["Parse"] = "parse";
        RequestType["Serialize"] = "serialize";
    })(RequestType || (RequestType = {}));
    var SubmissionType;
    (function (SubmissionType) {
        SubmissionType["Run"] = "run";
        SubmissionType["Diagnose"] = "diagnose";
    })(SubmissionType || (SubmissionType = {}));

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class PromiseCompletionSource {
        constructor() {
            this._resolve = () => { };
            this._reject = () => { };
            this.promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
            });
        }
        resolve(value) {
            this._resolve(value);
        }
        reject(reason) {
            this._reject(reason);
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class KernelInvocationContext {
        constructor(kernelCommandInvocation) {
            this._childCommands = [];
            this._eventSubject = new Subject();
            this._isComplete = false;
            this._handlingKernel = null;
            this.completionSource = new PromiseCompletionSource();
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
                            tryAddUriToRoutingSlip(kernelCommandInvocation, uri);
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
                    eventType: CommandSucceededType,
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
                eventType: CommandFailedType,
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
                tryAddUriToRoutingSlip(kernelEvent, getKernelUri(this.handlingKernel));
                kernelEvent.routingSlip; //?
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
    KernelInvocationContext._current = null;
    function areCommandsTheSame(envelope1, envelope2) {
        return envelope1 === envelope2
            || ((envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.commandType) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.commandType) && (envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.token) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.token) && (envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.id) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.id));
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.
    class Guid {
        constructor(guid) {
            if (!guid) {
                throw new TypeError("Invalid argument; `value` has no value.");
            }
            this.value = Guid.EMPTY;
            if (guid && Guid.isGuid(guid)) {
                this.value = guid;
            }
        }
        static isGuid(guid) {
            const value = guid.toString();
            return guid && (guid instanceof Guid || Guid.validator.test(value));
        }
        static create() {
            return new Guid([Guid.gen(2), Guid.gen(1), Guid.gen(1), Guid.gen(1), Guid.gen(3)].join("-"));
        }
        static createEmpty() {
            return new Guid("emptyguid");
        }
        static parse(guid) {
            return new Guid(guid);
        }
        static raw() {
            return [Guid.gen(2), Guid.gen(1), Guid.gen(1), Guid.gen(1), Guid.gen(3)].join("-");
        }
        static gen(count) {
            let out = "";
            for (let i = 0; i < count; i++) {
                // tslint:disable-next-line:no-bitwise
                out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return out;
        }
        equals(other) {
            // Comparing string `value` against provided `guid` will auto-call
            // toString on `guid` for comparison
            return Guid.isGuid(other) && this.value === other.toString();
        }
        isEmpty() {
            return this.value === Guid.EMPTY;
        }
        toString() {
            return this.value;
        }
        toJSON() {
            return {
                value: this.value,
            };
        }
    }
    Guid.validator = new RegExp("^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$", "i");
    Guid.EMPTY = "00000000-0000-0000-0000-000000000000";
    class TokenGenerator {
        constructor() {
            this._seed = Guid.create().toString();
            this._counter = 0;
        }
        GetNewToken() {
            this._counter++;
            return `${this._seed}::${this._counter}`;
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Info"] = 0] = "Info";
        LogLevel[LogLevel["Warn"] = 1] = "Warn";
        LogLevel[LogLevel["Error"] = 2] = "Error";
        LogLevel[LogLevel["None"] = 3] = "None";
    })(LogLevel || (LogLevel = {}));
    class Logger {
        constructor(source, write) {
            this.source = source;
            this.write = write;
        }
        info(message) {
            this.write({ logLevel: LogLevel.Info, source: this.source, message });
        }
        warn(message) {
            this.write({ logLevel: LogLevel.Warn, source: this.source, message });
        }
        error(message) {
            this.write({ logLevel: LogLevel.Error, source: this.source, message });
        }
        static configure(source, writer) {
            const logger = new Logger(source, writer);
            Logger._default = logger;
        }
        static get default() {
            if (Logger._default) {
                return Logger._default;
            }
            throw new Error('No logger has been configured for this context');
        }
    }
    Logger._default = new Logger('default', (_entry) => { });

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class KernelScheduler {
        constructor() {
            this._operationQueue = [];
        }
        cancelCurrentOperation() {
            var _a;
            (_a = this._inFlightOperation) === null || _a === void 0 ? void 0 : _a.promiseCompletionSource.reject(new Error("Operation cancelled"));
        }
        runAsync(value, executor) {
            const operation = {
                value,
                executor,
                promiseCompletionSource: new PromiseCompletionSource(),
            };
            if (this._inFlightOperation) {
                Logger.default.info(`kernelScheduler: starting immediate execution of ${JSON.stringify(operation.value)}`);
                // invoke immediately
                return operation.executor(operation.value)
                    .then(() => {
                    Logger.default.info(`kernelScheduler: immediate execution completed: ${JSON.stringify(operation.value)}`);
                    operation.promiseCompletionSource.resolve();
                })
                    .catch(e => {
                    Logger.default.info(`kernelScheduler: immediate execution failed: ${JSON.stringify(e)} - ${JSON.stringify(operation.value)}`);
                    operation.promiseCompletionSource.reject(e);
                });
            }
            Logger.default.info(`kernelScheduler: scheduling execution of ${JSON.stringify(operation.value)}`);
            this._operationQueue.push(operation);
            if (this._operationQueue.length === 1) {
                this.executeNextCommand();
            }
            return operation.promiseCompletionSource.promise;
        }
        executeNextCommand() {
            const nextOperation = this._operationQueue.length > 0 ? this._operationQueue[0] : undefined;
            if (nextOperation) {
                this._inFlightOperation = nextOperation;
                Logger.default.info(`kernelScheduler: starting scheduled execution of ${JSON.stringify(nextOperation.value)}`);
                nextOperation.executor(nextOperation.value)
                    .then(() => {
                    this._inFlightOperation = undefined;
                    Logger.default.info(`kernelScheduler: completing inflight operation: success ${JSON.stringify(nextOperation.value)}`);
                    nextOperation.promiseCompletionSource.resolve();
                })
                    .catch(e => {
                    this._inFlightOperation = undefined;
                    Logger.default.info(`kernelScheduler: completing inflight operation: failure ${JSON.stringify(e)} - ${JSON.stringify(nextOperation.value)}`);
                    nextOperation.promiseCompletionSource.reject(e);
                })
                    .finally(() => {
                    this._operationQueue.shift();
                    this.executeNextCommand();
                });
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    var KernelType;
    (function (KernelType) {
        KernelType[KernelType["composite"] = 0] = "composite";
        KernelType[KernelType["proxy"] = 1] = "proxy";
        KernelType[KernelType["default"] = 2] = "default";
    })(KernelType || (KernelType = {}));
    class Kernel {
        constructor(name, languageName, languageVersion) {
            this.name = name;
            this._commandHandlers = new Map();
            this._eventSubject = new Subject();
            this._tokenGenerator = new TokenGenerator();
            this.rootKernel = this;
            this.parentKernel = null;
            this._scheduler = null;
            this._kernelType = KernelType.default;
            this._kernelInfo = {
                localName: name,
                languageName: languageName,
                aliases: [],
                languageVersion: languageVersion,
                supportedDirectives: [],
                supportedKernelCommands: []
            };
            this._internalRegisterCommandHandler({
                commandType: RequestKernelInfoType, handle: (invocation) => __awaiter(this, void 0, void 0, function* () {
                    yield this.handleRequestKernelInfo(invocation);
                })
            });
        }
        get kernelInfo() {
            return this._kernelInfo;
        }
        get kernelType() {
            return this._kernelType;
        }
        set kernelType(value) {
            this._kernelType = value;
        }
        get kernelEvents() {
            return this._eventSubject.asObservable();
        }
        handleRequestKernelInfo(invocation) {
            return __awaiter(this, void 0, void 0, function* () {
                const eventEnvelope = {
                    eventType: KernelInfoProducedType,
                    command: invocation.commandEnvelope,
                    event: { kernelInfo: this._kernelInfo }
                }; //?
                invocation.context.publish(eventEnvelope);
                return Promise.resolve();
            });
        }
        getScheduler() {
            var _a, _b;
            if (!this._scheduler) {
                this._scheduler = (_b = (_a = this.parentKernel) === null || _a === void 0 ? void 0 : _a.getScheduler()) !== null && _b !== void 0 ? _b : new KernelScheduler();
            }
            return this._scheduler;
        }
        ensureCommandTokenAndId(commandEnvelope) {
            var _a;
            if (!commandEnvelope.token) {
                let nextToken = this._tokenGenerator.GetNewToken();
                if ((_a = KernelInvocationContext.current) === null || _a === void 0 ? void 0 : _a.commandEnvelope) {
                    // a parent command exists, create a token hierarchy
                    nextToken = KernelInvocationContext.current.commandEnvelope.token;
                }
                commandEnvelope.token = nextToken;
            }
            if (!commandEnvelope.id) {
                commandEnvelope.id = Guid.create().toString();
            }
        }
        static get current() {
            if (KernelInvocationContext.current) {
                return KernelInvocationContext.current.handlingKernel;
            }
            return null;
        }
        static get root() {
            if (Kernel.current) {
                return Kernel.current.rootKernel;
            }
            return null;
        }
        // Is it worth us going to efforts to ensure that the Promise returned here accurately reflects
        // the command's progress? The only thing that actually calls this is the kernel channel, through
        // the callback set up by attachKernelToChannel, and the callback is expected to return void, so
        // nothing is ever going to look at the promise we return here.
        send(commandEnvelope) {
            return __awaiter(this, void 0, void 0, function* () {
                this.ensureCommandTokenAndId(commandEnvelope);
                tryAddUriToRoutingSlip(commandEnvelope, getKernelUri(this));
                commandEnvelope.routingSlip; //?
                KernelInvocationContext.establish(commandEnvelope);
                return this.getScheduler().runAsync(commandEnvelope, (value) => this.executeCommand(value));
            });
        }
        executeCommand(commandEnvelope) {
            return __awaiter(this, void 0, void 0, function* () {
                let context = KernelInvocationContext.establish(commandEnvelope);
                let previousHandlingKernel = context.handlingKernel;
                try {
                    yield this.handleCommand(commandEnvelope);
                }
                catch (e) {
                    context.fail((e === null || e === void 0 ? void 0 : e.message) || JSON.stringify(e));
                }
                finally {
                    context.handlingKernel = previousHandlingKernel;
                }
            });
        }
        getCommandHandler(commandType) {
            return this._commandHandlers.get(commandType);
        }
        handleCommand(commandEnvelope) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let context = KernelInvocationContext.establish(commandEnvelope);
                const previoudHendlingKernel = context.handlingKernel;
                context.handlingKernel = this;
                let isRootCommand = areCommandsTheSame(context.commandEnvelope, commandEnvelope);
                let eventSubscription = undefined; //?
                if (isRootCommand) {
                    this.name; //?
                    Logger.default.info(`kernel ${this.name} of type ${KernelType[this.kernelType]} subscribing to context events`);
                    eventSubscription = context.kernelEvents.pipe(map(e => {
                        var _a;
                        const message = `kernel ${this.name} of type ${KernelType[this.kernelType]} saw event ${e.eventType} with token ${(_a = e.command) === null || _a === void 0 ? void 0 : _a.token}`;
                        Logger.default.info(message);
                        tryAddUriToRoutingSlip(e, getKernelUri(this));
                        return e;
                    }))
                        .subscribe(this.publishEvent.bind(this));
                }
                let handler = this.getCommandHandler(commandEnvelope.commandType);
                if (handler) {
                    try {
                        Logger.default.info(`kernel ${this.name} about to handle command: ${JSON.stringify(commandEnvelope)}`);
                        yield handler.handle({ commandEnvelope: commandEnvelope, context });
                        context.complete(commandEnvelope);
                        context.handlingKernel = previoudHendlingKernel;
                        if (isRootCommand) {
                            eventSubscription === null || eventSubscription === void 0 ? void 0 : eventSubscription.unsubscribe();
                            context.dispose();
                        }
                        Logger.default.info(`kernel ${this.name} done handling command: ${JSON.stringify(commandEnvelope)}`);
                        resolve();
                    }
                    catch (e) {
                        context.fail((e === null || e === void 0 ? void 0 : e.message) || JSON.stringify(e));
                        context.handlingKernel = previoudHendlingKernel;
                        if (isRootCommand) {
                            eventSubscription === null || eventSubscription === void 0 ? void 0 : eventSubscription.unsubscribe();
                            context.dispose();
                        }
                        reject(e);
                    }
                }
                else {
                    context.handlingKernel = previoudHendlingKernel;
                    if (isRootCommand) {
                        eventSubscription === null || eventSubscription === void 0 ? void 0 : eventSubscription.unsubscribe();
                        context.dispose();
                    }
                    reject(new Error(`No handler found for command type ${commandEnvelope.commandType}`));
                }
            }));
        }
        subscribeToKernelEvents(observer) {
            const sub = this._eventSubject.subscribe(observer);
            return {
                dispose: () => { sub.unsubscribe(); }
            };
        }
        canHandle(commandEnvelope) {
            if (commandEnvelope.command.targetKernelName && commandEnvelope.command.targetKernelName !== this.name) {
                return false;
            }
            if (commandEnvelope.command.destinationUri) {
                if (this.kernelInfo.uri !== commandEnvelope.command.destinationUri) {
                    return false;
                }
            }
            return this.supportsCommand(commandEnvelope.commandType);
        }
        supportsCommand(commandType) {
            return this._commandHandlers.has(commandType);
        }
        registerCommandHandler(handler) {
            // When a registration already existed, we want to overwrite it because we want users to
            // be able to develop handlers iteratively, and it would be unhelpful for handler registration
            // for any particular command to be cumulative.
            const shouldNotify = !this._commandHandlers.has(handler.commandType);
            this._internalRegisterCommandHandler(handler);
            if (shouldNotify) {
                const event = {
                    kernelInfo: this._kernelInfo,
                };
                const envelope = {
                    eventType: KernelInfoProducedType,
                    event: event
                };
                tryAddUriToRoutingSlip(envelope, getKernelUri(this));
                const context = KernelInvocationContext.current;
                if (context) {
                    envelope.command = context.commandEnvelope;
                    context.publish(envelope);
                }
                else {
                    this.publishEvent(envelope);
                }
            }
        }
        _internalRegisterCommandHandler(handler) {
            this._commandHandlers.set(handler.commandType, handler);
            this._kernelInfo.supportedKernelCommands = Array.from(this._commandHandlers.keys()).map(commandName => ({ name: commandName }));
        }
        getHandlingKernel(commandEnvelope, context) {
            if (this.canHandle(commandEnvelope)) {
                return this;
            }
            else {
                context === null || context === void 0 ? void 0 : context.fail(`Command ${commandEnvelope.commandType} is not supported by Kernel ${this.name}`);
                return null;
            }
        }
        publishEvent(kernelEvent) {
            this._eventSubject.next(kernelEvent);
        }
    }
    function getKernelUri(kernel) {
        var _a;
        return (_a = kernel.kernelInfo.uri) !== null && _a !== void 0 ? _a : `kernel://local/${kernel.kernelInfo.localName}`;
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    function isKernelCommandEnvelope(commandOrEvent) {
        return commandOrEvent.commandType !== undefined;
    }
    function isKernelEventEnvelope(commandOrEvent) {
        return commandOrEvent.eventType !== undefined;
    }
    class KernelCommandAndEventReceiver {
        constructor(observer) {
            this._disposables = [];
            this._observable = observer;
        }
        subscribe(observer) {
            return this._observable.subscribe(observer);
        }
        dispose() {
            for (let disposable of this._disposables) {
                disposable.dispose();
            }
        }
        static FromObservable(observable) {
            return new KernelCommandAndEventReceiver(observable);
        }
        static FromEventListener(args) {
            let subject = new Subject();
            args.eventTarget.addEventListener(args.event, (e) => {
                let mapped = args.map(e);
                subject.next(mapped);
            });
            return new KernelCommandAndEventReceiver(subject);
        }
    }
    function isObservable(source) {
        return source.next !== undefined;
    }
    class KernelCommandAndEventSender {
        constructor() {
        }
        send(kernelCommandOrEventEnvelope) {
            if (this._sender) {
                try {
                    if (typeof this._sender === "function") {
                        this._sender(kernelCommandOrEventEnvelope);
                    }
                    else if (isObservable(this._sender)) {
                        this._sender.next(kernelCommandOrEventEnvelope);
                    }
                    else {
                        return Promise.reject(new Error("Sender is not set"));
                    }
                }
                catch (error) {
                    return Promise.reject(error);
                }
                return Promise.resolve();
            }
            return Promise.reject(new Error("Sender is not set"));
        }
        static FromObserver(observer) {
            const sender = new KernelCommandAndEventSender();
            sender._sender = observer;
            return sender;
        }
        static FromFunction(send) {
            const sender = new KernelCommandAndEventSender();
            sender._sender = send;
            return sender;
        }
    }
    function tryAddUriToRoutingSlip(kernelCommandOrEventEnvelope, kernelUri) {
        if (kernelCommandOrEventEnvelope.routingSlip === undefined || kernelCommandOrEventEnvelope.routingSlip === null) {
            kernelCommandOrEventEnvelope.routingSlip = [];
        }
        var canAdd = !kernelCommandOrEventEnvelope.routingSlip.find(e => e === kernelUri);
        if (canAdd) {
            kernelCommandOrEventEnvelope.routingSlip.push(kernelUri);
            kernelCommandOrEventEnvelope.routingSlip; //?
        }
        return canAdd;
    }
    function ensureOrUpdateProxyForKernelInfo(kernelInfoProduced, compositeKernel) {
        var _a;
        const uriToLookup = (_a = kernelInfoProduced.kernelInfo.remoteUri) !== null && _a !== void 0 ? _a : kernelInfoProduced.kernelInfo.uri;
        if (uriToLookup) {
            let kernel = compositeKernel.findKernelByUri(uriToLookup);
            if (!kernel) {
                // add
                if (compositeKernel.host) {
                    Logger.default.info(`creating proxy for uri [${uriToLookup}] with info ${JSON.stringify(kernelInfoProduced)}`);
                    kernel = compositeKernel.host.connectProxyKernel(kernelInfoProduced.kernelInfo.localName, uriToLookup, kernelInfoProduced.kernelInfo.aliases);
                }
                else {
                    throw new Error('no kernel host found');
                }
            }
            else {
                Logger.default.info(`patching proxy for uri [${uriToLookup}] with info ${JSON.stringify(kernelInfoProduced)}`);
            }
            if (kernel.kernelType === KernelType.proxy) {
                // patch
                updateKernelInfo(kernel.kernelInfo, kernelInfoProduced.kernelInfo);
            }
        }
    }
    function updateKernelInfo(destination, incoming) {
        var _a, _b;
        destination.languageName = (_a = incoming.languageName) !== null && _a !== void 0 ? _a : destination.languageName;
        destination.languageVersion = (_b = incoming.languageVersion) !== null && _b !== void 0 ? _b : destination.languageVersion;
        const supportedDirectives = new Set();
        const supportedCommands = new Set();
        if (!destination.supportedDirectives) {
            destination.supportedDirectives = [];
        }
        if (!destination.supportedKernelCommands) {
            destination.supportedKernelCommands = [];
        }
        for (const supportedDirective of destination.supportedDirectives) {
            supportedDirectives.add(supportedDirective.name);
        }
        for (const supportedCommand of destination.supportedKernelCommands) {
            supportedCommands.add(supportedCommand.name);
        }
        for (const supportedDirective of incoming.supportedDirectives) {
            if (!supportedDirectives.has(supportedDirective.name)) {
                supportedDirectives.add(supportedDirective.name);
                destination.supportedDirectives.push(supportedDirective);
            }
        }
        for (const supportedCommand of incoming.supportedKernelCommands) {
            if (!supportedCommands.has(supportedCommand.name)) {
                supportedCommands.add(supportedCommand.name);
                destination.supportedKernelCommands.push(supportedCommand);
            }
        }
    }
    class Connector {
        constructor(configuration) {
            this._remoteUris = new Set();
            this._receiver = configuration.receiver;
            this._sender = configuration.sender;
            if (configuration.remoteUris) {
                for (const remoteUri of configuration.remoteUris) {
                    const uri = extractHostAndNomalize(remoteUri);
                    if (uri) {
                        this._remoteUris.add(uri);
                    }
                }
            }
            this._listener = this._receiver.subscribe({
                next: (kernelCommandOrEventEnvelope) => {
                    var _a, _b;
                    if (isKernelEventEnvelope(kernelCommandOrEventEnvelope)) {
                        if (kernelCommandOrEventEnvelope.eventType === KernelInfoProducedType) {
                            const event = kernelCommandOrEventEnvelope.event;
                            if (!event.kernelInfo.remoteUri) {
                                const uri = extractHostAndNomalize(event.kernelInfo.uri);
                                if (uri) {
                                    this._remoteUris.add(uri);
                                }
                            }
                        }
                        if (((_b = (_a = kernelCommandOrEventEnvelope.routingSlip) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
                            const eventOrigin = kernelCommandOrEventEnvelope.routingSlip[0];
                            const uri = extractHostAndNomalize(eventOrigin);
                            if (uri) {
                                this._remoteUris.add(uri);
                            }
                        }
                    }
                }
            });
        }
        get remoteHostUris() {
            return Array.from(this._remoteUris.values());
        }
        get sender() {
            return this._sender;
        }
        get receiver() {
            return this._receiver;
        }
        canReach(remoteUri) {
            const host = extractHostAndNomalize(remoteUri); //?
            if (host) {
                return this._remoteUris.has(host);
            }
            return false;
        }
        dispose() {
            this._listener.unsubscribe();
        }
    }
    function extractHostAndNomalize(kernelUri) {
        var _a;
        const filter = /(?<host>.+:\/\/[^\/]+)(\/[^\/])*/gi;
        const match = filter.exec(kernelUri); //?
        if ((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.host) {
            const host = match.groups.host;
            return host; //?
        }
        return "";
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class CompositeKernel extends Kernel {
        constructor(name) {
            super(name);
            this._host = null;
            this._defaultKernelNamesByCommandType = new Map();
            this.kernelType = KernelType.composite;
            this._childKernels = new KernelCollection(this);
        }
        get childKernels() {
            return Array.from(this._childKernels);
        }
        get host() {
            return this._host;
        }
        set host(host) {
            this._host = host;
            if (this._host) {
                this.kernelInfo.uri = this._host.uri;
                this._childKernels.notifyThatHostWasSet();
            }
        }
        handleRequestKernelInfo(invocation) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let kernel of this._childKernels) {
                    if (kernel.supportsCommand(invocation.commandEnvelope.commandType)) {
                        yield kernel.handleCommand({ command: {}, commandType: RequestKernelInfoType });
                    }
                }
            });
        }
        add(kernel, aliases) {
            if (!kernel) {
                throw new Error("kernel cannot be null or undefined");
            }
            if (!this.defaultKernelName) {
                // default to first kernel
                this.defaultKernelName = kernel.name;
            }
            kernel.parentKernel = this;
            kernel.rootKernel = this.rootKernel;
            kernel.kernelEvents.subscribe({
                next: (event) => {
                    tryAddUriToRoutingSlip(event, getKernelUri(this));
                    this.publishEvent(event);
                }
            });
            if (aliases) {
                let set = new Set(aliases);
                if (kernel.kernelInfo.aliases) {
                    for (let alias in kernel.kernelInfo.aliases) {
                        set.add(alias);
                    }
                }
                kernel.kernelInfo.aliases = Array.from(set);
            }
            this._childKernels.add(kernel, aliases);
            const invocationContext = KernelInvocationContext.current;
            if (invocationContext) {
                invocationContext.commandEnvelope; //?
                invocationContext.publish({
                    eventType: KernelInfoProducedType,
                    event: {
                        kernelInfo: kernel.kernelInfo
                    },
                    command: invocationContext.commandEnvelope
                });
            }
            else {
                this.publishEvent({
                    eventType: KernelInfoProducedType,
                    event: {
                        kernelInfo: kernel.kernelInfo
                    }
                });
            }
        }
        findKernelByUri(uri) {
            return this._childKernels.tryGetByUri(uri);
        }
        findKernelByName(name) {
            return this._childKernels.tryGetByAlias(name);
        }
        setDefaultTargetKernelNameForCommand(commandType, kernelName) {
            this._defaultKernelNamesByCommandType.set(commandType, kernelName);
        }
        handleCommand(commandEnvelope) {
            var _a;
            const invocationContext = KernelInvocationContext.current;
            let kernel = commandEnvelope.command.targetKernelName === this.name
                ? this
                : this.getHandlingKernel(commandEnvelope, invocationContext);
            const previusoHandlingKernel = (_a = invocationContext === null || invocationContext === void 0 ? void 0 : invocationContext.handlingKernel) !== null && _a !== void 0 ? _a : null;
            if (kernel === this) {
                if (invocationContext !== null) {
                    invocationContext.handlingKernel = kernel;
                }
                return super.handleCommand(commandEnvelope).finally(() => {
                    if (invocationContext !== null) {
                        invocationContext.handlingKernel = previusoHandlingKernel;
                    }
                });
            }
            else if (kernel) {
                if (invocationContext !== null) {
                    invocationContext.handlingKernel = kernel;
                }
                tryAddUriToRoutingSlip(commandEnvelope, getKernelUri(kernel));
                return kernel.handleCommand(commandEnvelope).finally(() => {
                    if (invocationContext !== null) {
                        invocationContext.handlingKernel = previusoHandlingKernel;
                    }
                });
            }
            if (invocationContext !== null) {
                invocationContext.handlingKernel = previusoHandlingKernel;
            }
            return Promise.reject(new Error("Kernel not found: " + commandEnvelope.command.targetKernelName));
        }
        getHandlingKernel(commandEnvelope, context) {
            var _a, _b, _c, _d, _e;
            let kernel = null;
            if (commandEnvelope.command.destinationUri) {
                kernel = (_a = this._childKernels.tryGetByUri(commandEnvelope.command.destinationUri)) !== null && _a !== void 0 ? _a : null;
                if (kernel) {
                    return kernel;
                }
            }
            let targetKernelName = commandEnvelope.command.targetKernelName;
            if (targetKernelName === undefined || targetKernelName === null) {
                if (this.canHandle(commandEnvelope)) {
                    return this;
                }
                targetKernelName = (_b = this._defaultKernelNamesByCommandType.get(commandEnvelope.commandType)) !== null && _b !== void 0 ? _b : this.defaultKernelName;
            }
            if (targetKernelName !== undefined && targetKernelName !== null) {
                kernel = (_c = this._childKernels.tryGetByAlias(targetKernelName)) !== null && _c !== void 0 ? _c : null;
            }
            if (targetKernelName && !kernel) {
                const errorMessage = `Kernel not found: ${targetKernelName}`;
                Logger.default.error(errorMessage);
                throw new Error(errorMessage);
            }
            if (!kernel) {
                if (this._childKernels.count === 1) {
                    kernel = (_d = this._childKernels.single()) !== null && _d !== void 0 ? _d : null;
                }
            }
            if (!kernel) {
                kernel = (_e = context === null || context === void 0 ? void 0 : context.handlingKernel) !== null && _e !== void 0 ? _e : null;
            }
            return kernel !== null && kernel !== void 0 ? kernel : this;
        }
    }
    class KernelCollection {
        constructor(compositeKernel) {
            this._kernels = [];
            this._nameAndAliasesByKernel = new Map();
            this._kernelsByNameOrAlias = new Map();
            this._kernelsByLocalUri = new Map();
            this._kernelsByRemoteUri = new Map();
            this._compositeKernel = compositeKernel;
        }
        [Symbol.iterator]() {
            let counter = 0;
            return {
                next: () => {
                    return {
                        value: this._kernels[counter++],
                        done: counter > this._kernels.length //?
                    };
                }
            };
        }
        single() {
            return this._kernels.length === 1 ? this._kernels[0] : undefined;
        }
        add(kernel, aliases) {
            if (this._kernelsByNameOrAlias.has(kernel.name)) {
                throw new Error(`kernel with name ${kernel.name} already exists`);
            }
            this.updateKernelInfoAndIndex(kernel, aliases);
            this._kernels.push(kernel);
        }
        get count() {
            return this._kernels.length;
        }
        updateKernelInfoAndIndex(kernel, aliases) {
            var _a;
            if (aliases) {
                for (let alias of aliases) {
                    if (this._kernelsByNameOrAlias.has(alias)) {
                        throw new Error(`kernel with alias ${alias} already exists`);
                    }
                }
            }
            if (!this._nameAndAliasesByKernel.has(kernel)) {
                let set = new Set();
                for (let alias of kernel.kernelInfo.aliases) {
                    set.add(alias);
                }
                kernel.kernelInfo.aliases = Array.from(set);
                set.add(kernel.kernelInfo.localName);
                this._nameAndAliasesByKernel.set(kernel, set);
            }
            if (aliases) {
                for (let alias of aliases) {
                    this._nameAndAliasesByKernel.get(kernel).add(alias);
                }
            }
            (_a = this._nameAndAliasesByKernel.get(kernel)) === null || _a === void 0 ? void 0 : _a.forEach(alias => {
                this._kernelsByNameOrAlias.set(alias, kernel);
            });
            if (this._compositeKernel.host) {
                kernel.kernelInfo.uri = `${this._compositeKernel.host.uri}/${kernel.name}`; //?
                this._kernelsByLocalUri.set(kernel.kernelInfo.uri, kernel);
            }
            if (kernel.kernelType === KernelType.proxy) {
                this._kernelsByRemoteUri.set(kernel.kernelInfo.remoteUri, kernel);
            }
        }
        tryGetByAlias(alias) {
            return this._kernelsByNameOrAlias.get(alias);
        }
        tryGetByUri(uri) {
            let kernel = this._kernelsByLocalUri.get(uri) || this._kernelsByRemoteUri.get(uri);
            return kernel;
        }
        notifyThatHostWasSet() {
            for (let kernel of this._kernels) {
                this.updateKernelInfoAndIndex(kernel);
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class ConsoleCapture {
        constructor() {
            this.originalConsole = console;
            console = this;
        }
        set kernelInvocationContext(value) {
            this._kernelInvocationContext = value;
        }
        assert(value, message, ...optionalParams) {
            this.originalConsole.assert(value, message, optionalParams);
        }
        clear() {
            this.originalConsole.clear();
        }
        count(label) {
            this.originalConsole.count(label);
        }
        countReset(label) {
            this.originalConsole.countReset(label);
        }
        debug(message, ...optionalParams) {
            this.originalConsole.debug(message, optionalParams);
        }
        dir(obj, options) {
            this.originalConsole.dir(obj, options);
        }
        dirxml(...data) {
            this.originalConsole.dirxml(data);
        }
        error(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.error, ...[message, ...optionalParams]);
        }
        group(...label) {
            this.originalConsole.group(label);
        }
        groupCollapsed(...label) {
            this.originalConsole.groupCollapsed(label);
        }
        groupEnd() {
            this.originalConsole.groupEnd();
        }
        info(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.info, ...[message, ...optionalParams]);
        }
        log(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.log, ...[message, ...optionalParams]);
        }
        table(tabularData, properties) {
            this.originalConsole.table(tabularData, properties);
        }
        time(label) {
            this.originalConsole.time(label);
        }
        timeEnd(label) {
            this.originalConsole.timeEnd(label);
        }
        timeLog(label, ...data) {
            this.originalConsole.timeLog(label, data);
        }
        timeStamp(label) {
            this.originalConsole.timeStamp(label);
        }
        trace(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.trace, ...[message, ...optionalParams]);
        }
        warn(message, ...optionalParams) {
            this.originalConsole.warn(message, optionalParams);
        }
        profile(label) {
            this.originalConsole.profile(label);
        }
        profileEnd(label) {
            this.originalConsole.profileEnd(label);
        }
        dispose() {
            console = this.originalConsole;
        }
        redirectAndPublish(target, ...args) {
            if (this._kernelInvocationContext) {
                for (const arg of args) {
                    let mimeType;
                    let value;
                    if (typeof arg !== 'object' && !Array.isArray(arg)) {
                        mimeType = 'text/plain';
                        value = arg === null || arg === void 0 ? void 0 : arg.toString();
                    }
                    else {
                        mimeType = 'application/json';
                        value = JSON.stringify(arg);
                    }
                    const displayedValue = {
                        formattedValues: [
                            {
                                mimeType,
                                value,
                            }
                        ]
                    };
                    const eventEnvelope = {
                        eventType: DisplayedValueProducedType,
                        event: displayedValue,
                        command: this._kernelInvocationContext.commandEnvelope
                    };
                    this._kernelInvocationContext.publish(eventEnvelope);
                }
            }
            if (target) {
                target(...args);
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class JavascriptKernel extends Kernel {
        constructor(name) {
            super(name !== null && name !== void 0 ? name : "javascript", "Javascript");
            this.suppressedLocals = new Set(this.allLocalVariableNames());
            this.registerCommandHandler({ commandType: SubmitCodeType, handle: invocation => this.handleSubmitCode(invocation) });
            this.registerCommandHandler({ commandType: RequestValueInfosType, handle: invocation => this.handleRequestValueInfos(invocation) });
            this.registerCommandHandler({ commandType: RequestValueType, handle: invocation => this.handleRequestValue(invocation) });
            this.capture = new ConsoleCapture();
        }
        handleSubmitCode(invocation) {
            const _super = Object.create(null, {
                kernelInfo: { get: () => super.kernelInfo }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const submitCode = invocation.commandEnvelope.command;
                const code = submitCode.code;
                _super.kernelInfo.localName; //?
                _super.kernelInfo.uri; //?
                _super.kernelInfo.remoteUri; //?
                invocation.context.publish({ eventType: CodeSubmissionReceivedType, event: { code }, command: invocation.commandEnvelope });
                invocation.context.commandEnvelope.routingSlip; //?
                this.capture.kernelInvocationContext = invocation.context;
                let result = undefined;
                try {
                    const AsyncFunction = eval(`Object.getPrototypeOf(async function(){}).constructor`);
                    const evaluator = AsyncFunction("console", code);
                    result = yield evaluator(this.capture);
                    if (result !== undefined) {
                        const formattedValue = formatValue(result, 'application/json');
                        const event = {
                            formattedValues: [formattedValue]
                        };
                        invocation.context.publish({ eventType: ReturnValueProducedType, event, command: invocation.commandEnvelope });
                    }
                }
                catch (e) {
                    throw e; //?
                }
                finally {
                    this.capture.kernelInvocationContext = undefined;
                }
            });
        }
        handleRequestValueInfos(invocation) {
            const valueInfos = this.allLocalVariableNames().filter(v => !this.suppressedLocals.has(v)).map(v => ({ name: v, preferredMimeTypes: [] }));
            const event = {
                valueInfos
            };
            invocation.context.publish({ eventType: ValueInfosProducedType, event, command: invocation.commandEnvelope });
            return Promise.resolve();
        }
        handleRequestValue(invocation) {
            const requestValue = invocation.commandEnvelope.command;
            const rawValue = this.getLocalVariable(requestValue.name);
            const formattedValue = formatValue(rawValue, requestValue.mimeType || 'application/json');
            Logger.default.info(`returning ${JSON.stringify(formattedValue)} for ${requestValue.name}`);
            const event = {
                name: requestValue.name,
                formattedValue
            };
            invocation.context.publish({ eventType: ValueProducedType, event, command: invocation.commandEnvelope });
            return Promise.resolve();
        }
        allLocalVariableNames() {
            const result = [];
            try {
                for (const key in globalThis) {
                    try {
                        if (typeof globalThis[key] !== 'function') {
                            result.push(key);
                        }
                    }
                    catch (e) {
                        Logger.default.error(`error getting value for ${key} : ${e}`);
                    }
                }
            }
            catch (e) {
                Logger.default.error(`error scanning globla variables : ${e}`);
            }
            return result;
        }
        getLocalVariable(name) {
            return globalThis[name];
        }
    }
    function formatValue(arg, mimeType) {
        let value;
        switch (mimeType) {
            case 'text/plain':
                value = (arg === null || arg === void 0 ? void 0 : arg.toString()) || 'undefined';
                break;
            case 'application/json':
                value = JSON.stringify(arg);
                break;
            default:
                throw new Error(`unsupported mime type: ${mimeType}`);
        }
        return {
            mimeType,
            value,
        };
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class ProxyKernel extends Kernel {
        constructor(name, _sender, _receiver) {
            super(name);
            this.name = name;
            this._sender = _sender;
            this._receiver = _receiver;
            this.kernelType = KernelType.proxy;
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
            if (envelope.routingSlip === undefined || !envelope.routingSlip.find(e => e === getKernelUri(this))) {
                tryAddUriToRoutingSlip(envelope, getKernelUri(this));
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
            updateKernelInfo(this.kernelInfo, kernelInfoProduced.kernelInfo);
        }
        _commandHandler(commandInvocation) {
            var _a, _b;
            var _c, _d;
            return __awaiter(this, void 0, void 0, function* () {
                const commandToken = commandInvocation.commandEnvelope.token;
                const commandId = commandInvocation.commandEnvelope.id;
                const completionSource = new PromiseCompletionSource();
                // fix : is this the right way? We are trying to avoid forwarding events we just did forward
                let eventSubscription = this._receiver.subscribe({
                    next: (envelope) => {
                        if (isKernelEventEnvelope(envelope)) {
                            if (envelope.eventType === KernelInfoProducedType &&
                                (envelope.command === null || envelope.command === undefined)) {
                                const kernelInfoProduced = envelope.event;
                                this.updateKernelInfoFromEvent(kernelInfoProduced);
                                this.publishEvent({
                                    eventType: KernelInfoProducedType,
                                    event: { kernelInfo: this.kernelInfo }
                                });
                            }
                            else if (envelope.command.token === commandToken) {
                                for (const kernelUri of envelope.command.routingSlip) {
                                    tryAddUriToRoutingSlip(commandInvocation.commandEnvelope, kernelUri);
                                    envelope.command.routingSlip = commandInvocation.commandEnvelope.routingSlip; //?
                                }
                                switch (envelope.eventType) {
                                    case KernelInfoProducedType:
                                        {
                                            const kernelInfoProduced = envelope.event;
                                            if (kernelInfoProduced.kernelInfo.uri === this.kernelInfo.remoteUri) {
                                                this.updateKernelInfoFromEvent(kernelInfoProduced);
                                                this.delegatePublication({
                                                    eventType: KernelInfoProducedType,
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
                                    case CommandCancelledType:
                                    case CommandFailedType:
                                    case CommandSucceededType:
                                        Logger.default.info(`proxy name=${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] finished, envelopeid=${envelope.command.id}, commandid=${commandId}`);
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
                    Logger.default.info(`proxy ${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] forwarding command ${commandInvocation.commandEnvelope.commandType} to ${commandInvocation.commandEnvelope.command.destinationUri}`);
                    this._sender.send(commandInvocation.commandEnvelope);
                    Logger.default.info(`proxy ${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] about to await with token ${commandToken}`);
                    const enventEnvelope = yield completionSource.promise;
                    if (enventEnvelope.eventType === CommandFailedType) {
                        commandInvocation.context.fail(enventEnvelope.event.message);
                    }
                    Logger.default.info(`proxy ${this.name}[local uri:${this.kernelInfo.uri}, remote uri:${this.kernelInfo.remoteUri}] done awaiting with token ${commandToken}`);
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

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class KernelHost {
        constructor(kernel, sender, receiver, hostUri) {
            this._remoteUriToKernel = new Map();
            this._uriToKernel = new Map();
            this._kernelToKernelInfo = new Map();
            this._connectors = [];
            this._kernel = kernel;
            this._uri = hostUri || "kernel://vscode";
            this._kernel.host = this;
            this._scheduler = new KernelScheduler();
            this._defaultConnector = new Connector({ sender, receiver });
            this._connectors.push(this._defaultConnector);
        }
        get uri() {
            return this._uri;
        }
        tryGetKernelByRemoteUri(remoteUri) {
            return this._remoteUriToKernel.get(remoteUri);
        }
        trygetKernelByOriginUri(originUri) {
            return this._uriToKernel.get(originUri);
        }
        tryGetKernelInfo(kernel) {
            return this._kernelToKernelInfo.get(kernel);
        }
        addKernelInfo(kernel, kernelInfo) {
            kernelInfo.uri = `${this._uri}/${kernel.name}`; //?
            this._kernelToKernelInfo.set(kernel, kernelInfo);
            this._uriToKernel.set(kernelInfo.uri, kernel);
        }
        getKernel(kernelCommandEnvelope) {
            var _a;
            const uriToLookup = (_a = kernelCommandEnvelope.command.destinationUri) !== null && _a !== void 0 ? _a : kernelCommandEnvelope.command.originUri;
            let kernel = undefined;
            if (uriToLookup) {
                kernel = this._kernel.findKernelByUri(uriToLookup);
            }
            if (!kernel) {
                if (kernelCommandEnvelope.command.targetKernelName) {
                    kernel = this._kernel.findKernelByName(kernelCommandEnvelope.command.targetKernelName);
                }
            }
            kernel !== null && kernel !== void 0 ? kernel : (kernel = this._kernel);
            Logger.default.info(`Using Kernel ${kernel.name}`);
            return kernel;
        }
        connectProxyKernelOnDefaultConnector(localName, remoteKernelUri, aliases) {
            return this.connectProxyKernelOnConnector(localName, this._defaultConnector.sender, this._defaultConnector.receiver, remoteKernelUri, aliases);
        }
        tryAddConnector(connector) {
            if (!connector.remoteUris) {
                this._connectors.push(new Connector(connector));
                return true;
            }
            else {
                const found = connector.remoteUris.find(uri => this._connectors.find(c => c.canReach(uri)));
                if (!found) {
                    this._connectors.push(new Connector(connector));
                    return true;
                }
                return false;
            }
        }
        connectProxyKernel(localName, remoteKernelUri, aliases) {
            this._connectors; //?
            const connector = this._connectors.find(c => c.canReach(remoteKernelUri));
            if (!connector) {
                throw new Error(`Cannot find connector to reach ${remoteKernelUri}`);
            }
            let kernel = new ProxyKernel(localName, connector.sender, connector.receiver);
            kernel.kernelInfo.remoteUri = remoteKernelUri;
            this._kernel.add(kernel, aliases);
            return kernel;
        }
        connectProxyKernelOnConnector(localName, sender, receiver, remoteKernelUri, aliases) {
            let kernel = new ProxyKernel(localName, sender, receiver);
            kernel.kernelInfo.remoteUri = remoteKernelUri;
            this._kernel.add(kernel, aliases);
            return kernel;
        }
        tryGetConnector(remoteUri) {
            return this._connectors.find(c => c.canReach(remoteUri));
        }
        connect() {
            this._kernel.subscribeToKernelEvents(e => {
                Logger.default.info(`KernelHost forwarding event: ${JSON.stringify(e)}`);
                this._defaultConnector.sender.send(e);
            });
            this._defaultConnector.receiver.subscribe({
                next: (kernelCommandOrEventEnvelope) => {
                    if (isKernelCommandEnvelope(kernelCommandOrEventEnvelope)) {
                        Logger.default.info(`KernelHost dispacthing command: ${JSON.stringify(kernelCommandOrEventEnvelope)}`);
                        this._scheduler.runAsync(kernelCommandOrEventEnvelope, commandEnvelope => {
                            const kernel = this._kernel;
                            return kernel.send(commandEnvelope);
                        });
                    }
                }
            });
            this._defaultConnector.sender.send({ eventType: KernelReadyType, event: {}, routingSlip: [this._kernel.kernelInfo.uri] });
            this.publishKerneInfo();
        }
        publishKerneInfo() {
            const events = this.getKernelInfoProduced();
            for (const event of events) {
                this._defaultConnector.sender.send(event);
            }
        }
        getKernelInfoProduced() {
            let events = [];
            events.push({ eventType: KernelInfoProducedType, event: { kernelInfo: this._kernel.kernelInfo }, routingSlip: [this._kernel.kernelInfo.uri] });
            for (let kernel of this._kernel.childKernels) {
                events.push({ eventType: KernelInfoProducedType, event: { kernelInfo: kernel.kernelInfo }, routingSlip: [kernel.kernelInfo.uri] });
            }
            return events;
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    function createHost(global, compositeKernelName, configureRequire, logMessage, localToRemote, remoteToLocal, onReady) {
        Logger.configure(compositeKernelName, logMessage);
        global.interactive = {};
        configureRequire(global.interactive);
        const compositeKernel = new CompositeKernel(compositeKernelName);
        const kernelHost = new KernelHost(compositeKernel, KernelCommandAndEventSender.FromObserver(localToRemote), KernelCommandAndEventReceiver.FromObservable(remoteToLocal), `kernel://${compositeKernelName}`);
        remoteToLocal.subscribe({
            next: (envelope) => {
                if (isKernelEventEnvelope(envelope) && envelope.eventType === KernelInfoProducedType) {
                    const kernelInfoProduced = envelope.event;
                    ensureOrUpdateProxyForKernelInfo(kernelInfoProduced, compositeKernel);
                }
            }
        });
        // use composite kernel as root
        global.kernel = {
            get root() {
                return compositeKernel;
            }
        };
        global[compositeKernelName] = {
            compositeKernel,
            kernelHost,
        };
        const jsKernel = new JavascriptKernel();
        compositeKernel.add(jsKernel, ["js"]);
        kernelHost.connect();
        onReady();
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    function configure(global) {
        if (!global) {
            global = window;
        }
        const remoteToLocal = new Subject();
        const localToRemote = new Subject();
        localToRemote.subscribe({
            next: envelope => {
                // @ts-ignore
                postKernelMessage({ envelope });
            }
        });
        // @ts-ignore
        onDidReceiveKernelMessage((arg) => {
            var _a, _b;
            if (arg.envelope) {
                const envelope = (arg.envelope);
                if (isKernelEventEnvelope(envelope)) {
                    Logger.default.info(`channel got ${envelope.eventType} with token ${(_a = envelope.command) === null || _a === void 0 ? void 0 : _a.token} and id ${(_b = envelope.command) === null || _b === void 0 ? void 0 : _b.id}`);
                }
                remoteToLocal.next(envelope);
            }
        });
        createHost(global, 'webview', configureRequire, entry => {
            // @ts-ignore
            postKernelMessage({ logEntry: entry });
        }, localToRemote, remoteToLocal, () => {
            const kernelInfoProduced = (global['webview'].kernelHost).getKernelInfoProduced();
            const hostUri = (global['webview'].kernelHost).uri;
            // @ts-ignore
            postKernelMessage({ preloadCommand: '#!connect', kernelInfoProduced, hostUri });
        });
    }
    function configureRequire(interactive) {
        if ((typeof (require) !== typeof (Function)) || (typeof (require.config) !== typeof (Function))) {
            let require_script = document.createElement('script');
            require_script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js');
            require_script.setAttribute('type', 'text/javascript');
            require_script.onload = function () {
                interactive.configureRequire = (confing) => {
                    return require.config(confing) || require;
                };
            };
            document.getElementsByTagName('head')[0].appendChild(require_script);
        }
        else {
            interactive.configureRequire = (confing) => {
                return require.config(confing) || require;
            };
        }
    }
    configure(window);

    exports.configure = configure;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2VybmVsQXBpQm9vdHN0cmFwcGVyLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9pc0Z1bmN0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvY3JlYXRlRXJyb3JDbGFzcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL1Vuc3Vic2NyaXB0aW9uRXJyb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9hcnJSZW1vdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvU3Vic2NyaXB0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL2NvbmZpZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvdGltZW91dFByb3ZpZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvcmVwb3J0VW5oYW5kbGVkRXJyb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9ub29wLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvZXJyb3JDb250ZXh0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL1N1YnNjcmliZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc3ltYm9sL29ic2VydmFibGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9pZGVudGl0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL3BpcGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvT2JzZXJ2YWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2xpZnQuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL09wZXJhdG9yU3Vic2NyaWJlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL09iamVjdFVuc3Vic2NyaWJlZEVycm9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL1N1YmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21hcC5qcyIsIi4uL3NyYy9jb250cmFjdHMudHMiLCIuLi9zcmMvcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UudHMiLCIuLi9zcmMva2VybmVsSW52b2NhdGlvbkNvbnRleHQudHMiLCIuLi9zcmMvdG9rZW5HZW5lcmF0b3IudHMiLCIuLi9zcmMvbG9nZ2VyLnRzIiwiLi4vc3JjL2tlcm5lbFNjaGVkdWxlci50cyIsIi4uL3NyYy9rZXJuZWwudHMiLCIuLi9zcmMvY29ubmVjdGlvbi50cyIsIi4uL3NyYy9jb21wb3NpdGVLZXJuZWwudHMiLCIuLi9zcmMvY29uc29sZUNhcHR1cmUudHMiLCIuLi9zcmMvamF2YXNjcmlwdEtlcm5lbC50cyIsIi4uL3NyYy9wcm94eUtlcm5lbC50cyIsIi4uL3NyYy9rZXJuZWxIb3N0LnRzIiwiLi4vc3JjL3dlYnZpZXcvZnJvbnRFbmRIb3N0LnRzIiwiLi4vc3JjL3dlYnZpZXcva2VybmVsQXBpQm9vdHN0cmFwcGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzRnVuY3Rpb24uanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVycm9yQ2xhc3MoY3JlYXRlSW1wbCkge1xuICAgIHZhciBfc3VwZXIgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgRXJyb3IuY2FsbChpbnN0YW5jZSk7XG4gICAgICAgIGluc3RhbmNlLnN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgfTtcbiAgICB2YXIgY3RvckZ1bmMgPSBjcmVhdGVJbXBsKF9zdXBlcik7XG4gICAgY3RvckZ1bmMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICAgIGN0b3JGdW5jLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JGdW5jO1xuICAgIHJldHVybiBjdG9yRnVuYztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNyZWF0ZUVycm9yQ2xhc3MuanMubWFwIiwiaW1wb3J0IHsgY3JlYXRlRXJyb3JDbGFzcyB9IGZyb20gJy4vY3JlYXRlRXJyb3JDbGFzcyc7XG5leHBvcnQgdmFyIFVuc3Vic2NyaXB0aW9uRXJyb3IgPSBjcmVhdGVFcnJvckNsYXNzKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gVW5zdWJzY3JpcHRpb25FcnJvckltcGwoZXJyb3JzKSB7XG4gICAgICAgIF9zdXBlcih0aGlzKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gZXJyb3JzXG4gICAgICAgICAgICA/IGVycm9ycy5sZW5ndGggKyBcIiBlcnJvcnMgb2NjdXJyZWQgZHVyaW5nIHVuc3Vic2NyaXB0aW9uOlxcblwiICsgZXJyb3JzLm1hcChmdW5jdGlvbiAoZXJyLCBpKSB7IHJldHVybiBpICsgMSArIFwiKSBcIiArIGVyci50b1N0cmluZygpOyB9KS5qb2luKCdcXG4gICcpXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICB0aGlzLm5hbWUgPSAnVW5zdWJzY3JpcHRpb25FcnJvcic7XG4gICAgICAgIHRoaXMuZXJyb3JzID0gZXJyb3JzO1xuICAgIH07XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVVuc3Vic2NyaXB0aW9uRXJyb3IuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGFyclJlbW92ZShhcnIsIGl0ZW0pIHtcbiAgICBpZiAoYXJyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGFyci5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAwIDw9IGluZGV4ICYmIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFyclJlbW92ZS5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXksIF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlsL2lzRnVuY3Rpb24nO1xuaW1wb3J0IHsgVW5zdWJzY3JpcHRpb25FcnJvciB9IGZyb20gJy4vdXRpbC9VbnN1YnNjcmlwdGlvbkVycm9yJztcbmltcG9ydCB7IGFyclJlbW92ZSB9IGZyb20gJy4vdXRpbC9hcnJSZW1vdmUnO1xudmFyIFN1YnNjcmlwdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3Vic2NyaXB0aW9uKGluaXRpYWxUZWFyZG93bikge1xuICAgICAgICB0aGlzLmluaXRpYWxUZWFyZG93biA9IGluaXRpYWxUZWFyZG93bjtcbiAgICAgICAgdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZmluYWxpemVycyA9IG51bGw7XG4gICAgfVxuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBlXzEsIF9hLCBlXzIsIF9iO1xuICAgICAgICB2YXIgZXJyb3JzO1xuICAgICAgICBpZiAoIXRoaXMuY2xvc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX3BhcmVudGFnZSA9IHRoaXMuX3BhcmVudGFnZTtcbiAgICAgICAgICAgIGlmIChfcGFyZW50YWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShfcGFyZW50YWdlKSkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX3BhcmVudGFnZV8xID0gX192YWx1ZXMoX3BhcmVudGFnZSksIF9wYXJlbnRhZ2VfMV8xID0gX3BhcmVudGFnZV8xLm5leHQoKTsgIV9wYXJlbnRhZ2VfMV8xLmRvbmU7IF9wYXJlbnRhZ2VfMV8xID0gX3BhcmVudGFnZV8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IF9wYXJlbnRhZ2VfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudF8xLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9wYXJlbnRhZ2VfMV8xICYmICFfcGFyZW50YWdlXzFfMS5kb25lICYmIChfYSA9IF9wYXJlbnRhZ2VfMS5yZXR1cm4pKSBfYS5jYWxsKF9wYXJlbnRhZ2VfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9wYXJlbnRhZ2UucmVtb3ZlKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbml0aWFsRmluYWxpemVyID0gdGhpcy5pbml0aWFsVGVhcmRvd247XG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihpbml0aWFsRmluYWxpemVyKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxGaW5hbGl6ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzID0gZSBpbnN0YW5jZW9mIFVuc3Vic2NyaXB0aW9uRXJyb3IgPyBlLmVycm9ycyA6IFtlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX2ZpbmFsaXplcnMgPSB0aGlzLl9maW5hbGl6ZXJzO1xuICAgICAgICAgICAgaWYgKF9maW5hbGl6ZXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmluYWxpemVycyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2ZpbmFsaXplcnNfMSA9IF9fdmFsdWVzKF9maW5hbGl6ZXJzKSwgX2ZpbmFsaXplcnNfMV8xID0gX2ZpbmFsaXplcnNfMS5uZXh0KCk7ICFfZmluYWxpemVyc18xXzEuZG9uZTsgX2ZpbmFsaXplcnNfMV8xID0gX2ZpbmFsaXplcnNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaW5hbGl6ZXIgPSBfZmluYWxpemVyc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNGaW5hbGl6ZXIoZmluYWxpemVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBlcnJvcnMgIT09IG51bGwgJiYgZXJyb3JzICE9PSB2b2lkIDAgPyBlcnJvcnMgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVW5zdWJzY3JpcHRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBfX3NwcmVhZEFycmF5KF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChlcnJvcnMpKSwgX19yZWFkKGVyci5lcnJvcnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2ZpbmFsaXplcnNfMV8xICYmICFfZmluYWxpemVyc18xXzEuZG9uZSAmJiAoX2IgPSBfZmluYWxpemVyc18xLnJldHVybikpIF9iLmNhbGwoX2ZpbmFsaXplcnNfMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcnJvcnMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVW5zdWJzY3JpcHRpb25FcnJvcihlcnJvcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpcHRpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh0ZWFyZG93bikge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICh0ZWFyZG93biAmJiB0ZWFyZG93biAhPT0gdGhpcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgZXhlY0ZpbmFsaXplcih0ZWFyZG93bik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGVhcmRvd24gaW5zdGFuY2VvZiBTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlYXJkb3duLmNsb3NlZCB8fCB0ZWFyZG93bi5faGFzUGFyZW50KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGVhcmRvd24uX2FkZFBhcmVudCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKHRoaXMuX2ZpbmFsaXplcnMgPSAoX2EgPSB0aGlzLl9maW5hbGl6ZXJzKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXSkucHVzaCh0ZWFyZG93bik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2hhc1BhcmVudCA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgdmFyIF9wYXJlbnRhZ2UgPSB0aGlzLl9wYXJlbnRhZ2U7XG4gICAgICAgIHJldHVybiBfcGFyZW50YWdlID09PSBwYXJlbnQgfHwgKEFycmF5LmlzQXJyYXkoX3BhcmVudGFnZSkgJiYgX3BhcmVudGFnZS5pbmNsdWRlcyhwYXJlbnQpKTtcbiAgICB9O1xuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2FkZFBhcmVudCA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgdmFyIF9wYXJlbnRhZ2UgPSB0aGlzLl9wYXJlbnRhZ2U7XG4gICAgICAgIHRoaXMuX3BhcmVudGFnZSA9IEFycmF5LmlzQXJyYXkoX3BhcmVudGFnZSkgPyAoX3BhcmVudGFnZS5wdXNoKHBhcmVudCksIF9wYXJlbnRhZ2UpIDogX3BhcmVudGFnZSA/IFtfcGFyZW50YWdlLCBwYXJlbnRdIDogcGFyZW50O1xuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5fcmVtb3ZlUGFyZW50ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICB2YXIgX3BhcmVudGFnZSA9IHRoaXMuX3BhcmVudGFnZTtcbiAgICAgICAgaWYgKF9wYXJlbnRhZ2UgPT09IHBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KF9wYXJlbnRhZ2UpKSB7XG4gICAgICAgICAgICBhcnJSZW1vdmUoX3BhcmVudGFnZSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAodGVhcmRvd24pIHtcbiAgICAgICAgdmFyIF9maW5hbGl6ZXJzID0gdGhpcy5fZmluYWxpemVycztcbiAgICAgICAgX2ZpbmFsaXplcnMgJiYgYXJyUmVtb3ZlKF9maW5hbGl6ZXJzLCB0ZWFyZG93bik7XG4gICAgICAgIGlmICh0ZWFyZG93biBpbnN0YW5jZW9mIFN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdGVhcmRvd24uX3JlbW92ZVBhcmVudCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLkVNUFRZID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVtcHR5ID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuICAgICAgICBlbXB0eS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gZW1wdHk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gU3Vic2NyaXB0aW9uO1xufSgpKTtcbmV4cG9ydCB7IFN1YnNjcmlwdGlvbiB9O1xuZXhwb3J0IHZhciBFTVBUWV9TVUJTQ1JJUFRJT04gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5leHBvcnQgZnVuY3Rpb24gaXNTdWJzY3JpcHRpb24odmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlIGluc3RhbmNlb2YgU3Vic2NyaXB0aW9uIHx8XG4gICAgICAgICh2YWx1ZSAmJiAnY2xvc2VkJyBpbiB2YWx1ZSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnJlbW92ZSkgJiYgaXNGdW5jdGlvbih2YWx1ZS5hZGQpICYmIGlzRnVuY3Rpb24odmFsdWUudW5zdWJzY3JpYmUpKSk7XG59XG5mdW5jdGlvbiBleGVjRmluYWxpemVyKGZpbmFsaXplcikge1xuICAgIGlmIChpc0Z1bmN0aW9uKGZpbmFsaXplcikpIHtcbiAgICAgICAgZmluYWxpemVyKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaW5hbGl6ZXIudW5zdWJzY3JpYmUoKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TdWJzY3JpcHRpb24uanMubWFwIiwiZXhwb3J0IHZhciBjb25maWcgPSB7XG4gICAgb25VbmhhbmRsZWRFcnJvcjogbnVsbCxcbiAgICBvblN0b3BwZWROb3RpZmljYXRpb246IG51bGwsXG4gICAgUHJvbWlzZTogdW5kZWZpbmVkLFxuICAgIHVzZURlcHJlY2F0ZWRTeW5jaHJvbm91c0Vycm9ySGFuZGxpbmc6IGZhbHNlLFxuICAgIHVzZURlcHJlY2F0ZWROZXh0Q29udGV4dDogZmFsc2UsXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uZmlnLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuZXhwb3J0IHZhciB0aW1lb3V0UHJvdmlkZXIgPSB7XG4gICAgc2V0VGltZW91dDogZnVuY3Rpb24gKGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGFyZ3NbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gdGltZW91dFByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUgPT09IG51bGwgfHwgZGVsZWdhdGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRlbGVnYXRlLnNldFRpbWVvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZS5zZXRUaW1lb3V0LmFwcGx5KGRlbGVnYXRlLCBfX3NwcmVhZEFycmF5KFtoYW5kbGVyLCB0aW1lb3V0XSwgX19yZWFkKGFyZ3MpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtoYW5kbGVyLCB0aW1lb3V0XSwgX19yZWFkKGFyZ3MpKSk7XG4gICAgfSxcbiAgICBjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uIChoYW5kbGUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gdGltZW91dFByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICByZXR1cm4gKChkZWxlZ2F0ZSA9PT0gbnVsbCB8fCBkZWxlZ2F0ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGVsZWdhdGUuY2xlYXJUaW1lb3V0KSB8fCBjbGVhclRpbWVvdXQpKGhhbmRsZSk7XG4gICAgfSxcbiAgICBkZWxlZ2F0ZTogdW5kZWZpbmVkLFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpbWVvdXRQcm92aWRlci5qcy5tYXAiLCJpbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgdGltZW91dFByb3ZpZGVyIH0gZnJvbSAnLi4vc2NoZWR1bGVyL3RpbWVvdXRQcm92aWRlcic7XG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0VW5oYW5kbGVkRXJyb3IoZXJyKSB7XG4gICAgdGltZW91dFByb3ZpZGVyLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGNvbmZpZy5vblVuaGFuZGxlZEVycm9yO1xuICAgICAgICBpZiAob25VbmhhbmRsZWRFcnJvcikge1xuICAgICAgICAgICAgb25VbmhhbmRsZWRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXBvcnRVbmhhbmRsZWRFcnJvci5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gbm9vcCgpIHsgfVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bm9vcC5qcy5tYXAiLCJpbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi9jb25maWcnO1xudmFyIGNvbnRleHQgPSBudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29udGV4dChjYikge1xuICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZykge1xuICAgICAgICB2YXIgaXNSb290ID0gIWNvbnRleHQ7XG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7IGVycm9yVGhyb3duOiBmYWxzZSwgZXJyb3I6IG51bGwgfTtcbiAgICAgICAgfVxuICAgICAgICBjYigpO1xuICAgICAgICBpZiAoaXNSb290KSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBjb250ZXh0LCBlcnJvclRocm93biA9IF9hLmVycm9yVGhyb3duLCBlcnJvciA9IF9hLmVycm9yO1xuICAgICAgICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUVycm9yKGVycikge1xuICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZyAmJiBjb250ZXh0KSB7XG4gICAgICAgIGNvbnRleHQuZXJyb3JUaHJvd24gPSB0cnVlO1xuICAgICAgICBjb250ZXh0LmVycm9yID0gZXJyO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVycm9yQ29udGV4dC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBpc1N1YnNjcmlwdGlvbiwgU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgcmVwb3J0VW5oYW5kbGVkRXJyb3IgfSBmcm9tICcuL3V0aWwvcmVwb3J0VW5oYW5kbGVkRXJyb3InO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4vdXRpbC9ub29wJztcbmltcG9ydCB7IG5leHROb3RpZmljYXRpb24sIGVycm9yTm90aWZpY2F0aW9uLCBDT01QTEVURV9OT1RJRklDQVRJT04gfSBmcm9tICcuL05vdGlmaWNhdGlvbkZhY3Rvcmllcyc7XG5pbXBvcnQgeyB0aW1lb3V0UHJvdmlkZXIgfSBmcm9tICcuL3NjaGVkdWxlci90aW1lb3V0UHJvdmlkZXInO1xuaW1wb3J0IHsgY2FwdHVyZUVycm9yIH0gZnJvbSAnLi91dGlsL2Vycm9yQ29udGV4dCc7XG52YXIgU3Vic2NyaWJlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFN1YnNjcmliZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU3Vic2NyaWJlcihkZXN0aW5hdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5pc1N0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGRlc3RpbmF0aW9uKSB7XG4gICAgICAgICAgICBfdGhpcy5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaXB0aW9uKGRlc3RpbmF0aW9uKSkge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLmFkZChfdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy5kZXN0aW5hdGlvbiA9IEVNUFRZX09CU0VSVkVSO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgU3Vic2NyaWJlci5jcmVhdGUgPSBmdW5jdGlvbiAobmV4dCwgZXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2FmZVN1YnNjcmliZXIobmV4dCwgZXJyb3IsIGNvbXBsZXRlKTtcbiAgICB9O1xuICAgIFN1YnNjcmliZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICBoYW5kbGVTdG9wcGVkTm90aWZpY2F0aW9uKG5leHROb3RpZmljYXRpb24odmFsdWUpLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX25leHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICBoYW5kbGVTdG9wcGVkTm90aWZpY2F0aW9uKGVycm9yTm90aWZpY2F0aW9uKGVyciksIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc1N0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgaGFuZGxlU3RvcHBlZE5vdGlmaWNhdGlvbihDT01QTEVURV9OT1RJRklDQVRJT04sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc1N0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUudW5zdWJzY3JpYmUuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5fbmV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmRlc3RpbmF0aW9uLm5leHQodmFsdWUpO1xuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUuX2Vycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbi5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5fY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBTdWJzY3JpYmVyO1xufShTdWJzY3JpcHRpb24pKTtcbmV4cG9ydCB7IFN1YnNjcmliZXIgfTtcbnZhciBfYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kO1xuZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBfYmluZC5jYWxsKGZuLCB0aGlzQXJnKTtcbn1cbnZhciBDb25zdW1lck9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb25zdW1lck9ic2VydmVyKHBhcnRpYWxPYnNlcnZlcikge1xuICAgICAgICB0aGlzLnBhcnRpYWxPYnNlcnZlciA9IHBhcnRpYWxPYnNlcnZlcjtcbiAgICB9XG4gICAgQ29uc3VtZXJPYnNlcnZlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgcGFydGlhbE9ic2VydmVyID0gdGhpcy5wYXJ0aWFsT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChwYXJ0aWFsT2JzZXJ2ZXIubmV4dCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYXJ0aWFsT2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIENvbnN1bWVyT2JzZXJ2ZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgcGFydGlhbE9ic2VydmVyID0gdGhpcy5wYXJ0aWFsT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChwYXJ0aWFsT2JzZXJ2ZXIuZXJyb3IpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFydGlhbE9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBDb25zdW1lck9ic2VydmVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBhcnRpYWxPYnNlcnZlciA9IHRoaXMucGFydGlhbE9ic2VydmVyO1xuICAgICAgICBpZiAocGFydGlhbE9ic2VydmVyLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBhcnRpYWxPYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlVW5oYW5kbGVkRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ29uc3VtZXJPYnNlcnZlcjtcbn0oKSk7XG52YXIgU2FmZVN1YnNjcmliZXIgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTYWZlU3Vic2NyaWJlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTYWZlU3Vic2NyaWJlcihvYnNlcnZlck9yTmV4dCwgZXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIHZhciBwYXJ0aWFsT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKG9ic2VydmVyT3JOZXh0KSB8fCAhb2JzZXJ2ZXJPck5leHQpIHtcbiAgICAgICAgICAgIHBhcnRpYWxPYnNlcnZlciA9IHtcbiAgICAgICAgICAgICAgICBuZXh0OiAob2JzZXJ2ZXJPck5leHQgIT09IG51bGwgJiYgb2JzZXJ2ZXJPck5leHQgIT09IHZvaWQgMCA/IG9ic2VydmVyT3JOZXh0IDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgIT09IG51bGwgJiYgZXJyb3IgIT09IHZvaWQgMCA/IGVycm9yIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSAhPT0gbnVsbCAmJiBjb21wbGV0ZSAhPT0gdm9pZCAwID8gY29tcGxldGUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNvbnRleHRfMTtcbiAgICAgICAgICAgIGlmIChfdGhpcyAmJiBjb25maWcudXNlRGVwcmVjYXRlZE5leHRDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF8xID0gT2JqZWN0LmNyZWF0ZShvYnNlcnZlck9yTmV4dCk7XG4gICAgICAgICAgICAgICAgY29udGV4dF8xLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMudW5zdWJzY3JpYmUoKTsgfTtcbiAgICAgICAgICAgICAgICBwYXJ0aWFsT2JzZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQ6IG9ic2VydmVyT3JOZXh0Lm5leHQgJiYgYmluZChvYnNlcnZlck9yTmV4dC5uZXh0LCBjb250ZXh0XzEpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogb2JzZXJ2ZXJPck5leHQuZXJyb3IgJiYgYmluZChvYnNlcnZlck9yTmV4dC5lcnJvciwgY29udGV4dF8xKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9ic2VydmVyT3JOZXh0LmNvbXBsZXRlICYmIGJpbmQob2JzZXJ2ZXJPck5leHQuY29tcGxldGUsIGNvbnRleHRfMSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpYWxPYnNlcnZlciA9IG9ic2VydmVyT3JOZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gbmV3IENvbnN1bWVyT2JzZXJ2ZXIocGFydGlhbE9ic2VydmVyKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gU2FmZVN1YnNjcmliZXI7XG59KFN1YnNjcmliZXIpKTtcbmV4cG9ydCB7IFNhZmVTdWJzY3JpYmVyIH07XG5mdW5jdGlvbiBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnJvcikge1xuICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZykge1xuICAgICAgICBjYXB0dXJlRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVwb3J0VW5oYW5kbGVkRXJyb3IoZXJyb3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsZXIoZXJyKSB7XG4gICAgdGhyb3cgZXJyO1xufVxuZnVuY3Rpb24gaGFuZGxlU3RvcHBlZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24sIHN1YnNjcmliZXIpIHtcbiAgICB2YXIgb25TdG9wcGVkTm90aWZpY2F0aW9uID0gY29uZmlnLm9uU3RvcHBlZE5vdGlmaWNhdGlvbjtcbiAgICBvblN0b3BwZWROb3RpZmljYXRpb24gJiYgdGltZW91dFByb3ZpZGVyLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gb25TdG9wcGVkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbiwgc3Vic2NyaWJlcik7IH0pO1xufVxuZXhwb3J0IHZhciBFTVBUWV9PQlNFUlZFUiA9IHtcbiAgICBjbG9zZWQ6IHRydWUsXG4gICAgbmV4dDogbm9vcCxcbiAgICBlcnJvcjogZGVmYXVsdEVycm9ySGFuZGxlcixcbiAgICBjb21wbGV0ZTogbm9vcCxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TdWJzY3JpYmVyLmpzLm1hcCIsImV4cG9ydCB2YXIgb2JzZXJ2YWJsZSA9IChmdW5jdGlvbiAoKSB7IHJldHVybiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wub2JzZXJ2YWJsZSkgfHwgJ0BAb2JzZXJ2YWJsZSc7IH0pKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYnNlcnZhYmxlLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gICAgcmV0dXJuIHg7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pZGVudGl0eS5qcy5tYXAiLCJpbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4vaWRlbnRpdHknO1xuZXhwb3J0IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgdmFyIGZucyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGZuc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gcGlwZUZyb21BcnJheShmbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBpcGVGcm9tQXJyYXkoZm5zKSB7XG4gICAgaWYgKGZucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5O1xuICAgIH1cbiAgICBpZiAoZm5zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gZm5zWzBdO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gcGlwZWQoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGZucy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGZuKSB7IHJldHVybiBmbihwcmV2KTsgfSwgaW5wdXQpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1waXBlLmpzLm1hcCIsImltcG9ydCB7IFNhZmVTdWJzY3JpYmVyLCBTdWJzY3JpYmVyIH0gZnJvbSAnLi9TdWJzY3JpYmVyJztcbmltcG9ydCB7IGlzU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgb2JzZXJ2YWJsZSBhcyBTeW1ib2xfb2JzZXJ2YWJsZSB9IGZyb20gJy4vc3ltYm9sL29ic2VydmFibGUnO1xuaW1wb3J0IHsgcGlwZUZyb21BcnJheSB9IGZyb20gJy4vdXRpbC9waXBlJztcbmltcG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBlcnJvckNvbnRleHQgfSBmcm9tICcuL3V0aWwvZXJyb3JDb250ZXh0JztcbnZhciBPYnNlcnZhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBPYnNlcnZhYmxlKHN1YnNjcmliZSkge1xuICAgICAgICBpZiAoc3Vic2NyaWJlKSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUubGlmdCA9IGZ1bmN0aW9uIChvcGVyYXRvcikge1xuICAgICAgICB2YXIgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIG9ic2VydmFibGUuc291cmNlID0gdGhpcztcbiAgICAgICAgb2JzZXJ2YWJsZS5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZTtcbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChvYnNlcnZlck9yTmV4dCwgZXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBzdWJzY3JpYmVyID0gaXNTdWJzY3JpYmVyKG9ic2VydmVyT3JOZXh0KSA/IG9ic2VydmVyT3JOZXh0IDogbmV3IFNhZmVTdWJzY3JpYmVyKG9ic2VydmVyT3JOZXh0LCBlcnJvciwgY29tcGxldGUpO1xuICAgICAgICBlcnJvckNvbnRleHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMsIG9wZXJhdG9yID0gX2Eub3BlcmF0b3IsIHNvdXJjZSA9IF9hLnNvdXJjZTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvci5jYWxsKHN1YnNjcmliZXIsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICA6IHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc3Vic2NyaWJlKHN1YnNjcmliZXIpXG4gICAgICAgICAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl90cnlTdWJzY3JpYmUoc3Vic2NyaWJlcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmliZXI7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlID0gZnVuY3Rpb24gKHNpbmspIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdWJzY3JpYmUoc2luayk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2luay5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKG5leHQsIHByb21pc2VDdG9yKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHByb21pc2VDdG9yID0gZ2V0UHJvbWlzZUN0b3IocHJvbWlzZUN0b3IpO1xuICAgICAgICByZXR1cm4gbmV3IHByb21pc2VDdG9yKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBzdWJzY3JpYmVyID0gbmV3IFNhZmVTdWJzY3JpYmVyKHtcbiAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogcmVqZWN0LFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiByZXNvbHZlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfdGhpcy5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3N1YnNjcmliZSA9IGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgcmV0dXJuIChfYSA9IHRoaXMuc291cmNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGVbU3ltYm9sX29ic2VydmFibGVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBvcGVyYXRpb25zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBpcGVGcm9tQXJyYXkob3BlcmF0aW9ucykodGhpcyk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS50b1Byb21pc2UgPSBmdW5jdGlvbiAocHJvbWlzZUN0b3IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcHJvbWlzZUN0b3IgPSBnZXRQcm9taXNlQ3Rvcihwcm9taXNlQ3Rvcik7XG4gICAgICAgIHJldHVybiBuZXcgcHJvbWlzZUN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlO1xuICAgICAgICAgICAgX3RoaXMuc3Vic2NyaWJlKGZ1bmN0aW9uICh4KSB7IHJldHVybiAodmFsdWUgPSB4KTsgfSwgZnVuY3Rpb24gKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH0sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlc29sdmUodmFsdWUpOyB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLmNyZWF0ZSA9IGZ1bmN0aW9uIChzdWJzY3JpYmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YnNjcmliZSk7XG4gICAgfTtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZTtcbn0oKSk7XG5leHBvcnQgeyBPYnNlcnZhYmxlIH07XG5mdW5jdGlvbiBnZXRQcm9taXNlQ3Rvcihwcm9taXNlQ3Rvcikge1xuICAgIHZhciBfYTtcbiAgICByZXR1cm4gKF9hID0gcHJvbWlzZUN0b3IgIT09IG51bGwgJiYgcHJvbWlzZUN0b3IgIT09IHZvaWQgMCA/IHByb21pc2VDdG9yIDogY29uZmlnLlByb21pc2UpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFByb21pc2U7XG59XG5mdW5jdGlvbiBpc09ic2VydmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIGlzRnVuY3Rpb24odmFsdWUubmV4dCkgJiYgaXNGdW5jdGlvbih2YWx1ZS5lcnJvcikgJiYgaXNGdW5jdGlvbih2YWx1ZS5jb21wbGV0ZSk7XG59XG5mdW5jdGlvbiBpc1N1YnNjcmliZXIodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYmIHZhbHVlIGluc3RhbmNlb2YgU3Vic2NyaWJlcikgfHwgKGlzT2JzZXJ2ZXIodmFsdWUpICYmIGlzU3Vic2NyaXB0aW9uKHZhbHVlKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1PYnNlcnZhYmxlLmpzLm1hcCIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0xpZnQoc291cmNlKSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oc291cmNlID09PSBudWxsIHx8IHNvdXJjZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogc291cmNlLmxpZnQpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG9wZXJhdGUoaW5pdCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgIGlmIChoYXNMaWZ0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2UubGlmdChmdW5jdGlvbiAobGlmdGVkU291cmNlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluaXQobGlmdGVkU291cmNlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGxpZnQgdW5rbm93biBPYnNlcnZhYmxlIHR5cGUnKTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGlmdC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YnNjcmliZXIgfSBmcm9tICcuLi9TdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVyYXRvclN1YnNjcmliZXIoZGVzdGluYXRpb24sIG9uTmV4dCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25GaW5hbGl6ZSkge1xuICAgIHJldHVybiBuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKGRlc3RpbmF0aW9uLCBvbk5leHQsIG9uQ29tcGxldGUsIG9uRXJyb3IsIG9uRmluYWxpemUpO1xufVxudmFyIE9wZXJhdG9yU3Vic2NyaWJlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE9wZXJhdG9yU3Vic2NyaWJlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBPcGVyYXRvclN1YnNjcmliZXIoZGVzdGluYXRpb24sIG9uTmV4dCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25GaW5hbGl6ZSwgc2hvdWxkVW5zdWJzY3JpYmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgZGVzdGluYXRpb24pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLm9uRmluYWxpemUgPSBvbkZpbmFsaXplO1xuICAgICAgICBfdGhpcy5zaG91bGRVbnN1YnNjcmliZSA9IHNob3VsZFVuc3Vic2NyaWJlO1xuICAgICAgICBfdGhpcy5fbmV4dCA9IG9uTmV4dFxuICAgICAgICAgICAgPyBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBvbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBfc3VwZXIucHJvdG90eXBlLl9uZXh0O1xuICAgICAgICBfdGhpcy5fZXJyb3IgPSBvbkVycm9yXG4gICAgICAgICAgICA/IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24uZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IF9zdXBlci5wcm90b3R5cGUuX2Vycm9yO1xuICAgICAgICBfdGhpcy5fY29tcGxldGUgPSBvbkNvbXBsZXRlXG4gICAgICAgICAgICA/IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24uZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IF9zdXBlci5wcm90b3R5cGUuX2NvbXBsZXRlO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIE9wZXJhdG9yU3Vic2NyaWJlci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFVuc3Vic2NyaWJlIHx8IHRoaXMuc2hvdWxkVW5zdWJzY3JpYmUoKSkge1xuICAgICAgICAgICAgdmFyIGNsb3NlZF8xID0gdGhpcy5jbG9zZWQ7XG4gICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLnVuc3Vic2NyaWJlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAhY2xvc2VkXzEgJiYgKChfYSA9IHRoaXMub25GaW5hbGl6ZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNhbGwodGhpcykpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gT3BlcmF0b3JTdWJzY3JpYmVyO1xufShTdWJzY3JpYmVyKSk7XG5leHBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9wZXJhdG9yU3Vic2NyaWJlci5qcy5tYXAiLCJpbXBvcnQgeyBjcmVhdGVFcnJvckNsYXNzIH0gZnJvbSAnLi9jcmVhdGVFcnJvckNsYXNzJztcbmV4cG9ydCB2YXIgT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IgPSBjcmVhdGVFcnJvckNsYXNzKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3JJbXBsKCkge1xuICAgICAgICBfc3VwZXIodGhpcyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdPYmplY3RVbnN1YnNjcmliZWRFcnJvcic7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9ICdvYmplY3QgdW5zdWJzY3JpYmVkJztcbiAgICB9O1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1PYmplY3RVbnN1YnNjcmliZWRFcnJvci5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMsIF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgRU1QVFlfU1VCU0NSSVBUSU9OIH0gZnJvbSAnLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IgfSBmcm9tICcuL3V0aWwvT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3InO1xuaW1wb3J0IHsgYXJyUmVtb3ZlIH0gZnJvbSAnLi91dGlsL2FyclJlbW92ZSc7XG5pbXBvcnQgeyBlcnJvckNvbnRleHQgfSBmcm9tICcuL3V0aWwvZXJyb3JDb250ZXh0JztcbnZhciBTdWJqZWN0ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU3ViamVjdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTdWJqZWN0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuY3VycmVudE9ic2VydmVycyA9IG51bGw7XG4gICAgICAgIF90aGlzLm9ic2VydmVycyA9IFtdO1xuICAgICAgICBfdGhpcy5pc1N0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuaGFzRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMudGhyb3duRXJyb3IgPSBudWxsO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFN1YmplY3QucHJvdG90eXBlLmxpZnQgPSBmdW5jdGlvbiAob3BlcmF0b3IpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBuZXcgQW5vbnltb3VzU3ViamVjdCh0aGlzLCB0aGlzKTtcbiAgICAgICAgc3ViamVjdC5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLl90aHJvd0lmQ2xvc2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBPYmplY3RVbnN1YnNjcmliZWRFcnJvcigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGVycm9yQ29udGV4dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIF90aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuY3VycmVudE9ic2VydmVycykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50T2JzZXJ2ZXJzID0gQXJyYXkuZnJvbShfdGhpcy5vYnNlcnZlcnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKF90aGlzLmN1cnJlbnRPYnNlcnZlcnMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgZXJyb3JDb250ZXh0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmhhc0Vycm9yID0gX3RoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy50aHJvd25FcnJvciA9IGVycjtcbiAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gX3RoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgICAgIHdoaWxlIChvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zaGlmdCgpLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBlcnJvckNvbnRleHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuX3Rocm93SWZDbG9zZWQoKTtcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gX3RoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgICAgIHdoaWxlIChvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zaGlmdCgpLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzU3RvcHBlZCA9IHRoaXMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB0aGlzLmN1cnJlbnRPYnNlcnZlcnMgPSBudWxsO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN1YmplY3QucHJvdG90eXBlLCBcIm9ic2VydmVkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICByZXR1cm4gKChfYSA9IHRoaXMub2JzZXJ2ZXJzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubGVuZ3RoKSA+IDA7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dJZkNsb3NlZCgpO1xuICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlLmNhbGwodGhpcywgc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dJZkNsb3NlZCgpO1xuICAgICAgICB0aGlzLl9jaGVja0ZpbmFsaXplZFN0YXR1c2VzKHN1YnNjcmliZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5faW5uZXJTdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5faW5uZXJTdWJzY3JpYmUgPSBmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgX2EgPSB0aGlzLCBoYXNFcnJvciA9IF9hLmhhc0Vycm9yLCBpc1N0b3BwZWQgPSBfYS5pc1N0b3BwZWQsIG9ic2VydmVycyA9IF9hLm9ic2VydmVycztcbiAgICAgICAgaWYgKGhhc0Vycm9yIHx8IGlzU3RvcHBlZCkge1xuICAgICAgICAgICAgcmV0dXJuIEVNUFRZX1NVQlNDUklQVElPTjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlcnMgPSBudWxsO1xuICAgICAgICBvYnNlcnZlcnMucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWJzY3JpcHRpb24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuY3VycmVudE9ic2VydmVycyA9IG51bGw7XG4gICAgICAgICAgICBhcnJSZW1vdmUob2JzZXJ2ZXJzLCBzdWJzY3JpYmVyKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fY2hlY2tGaW5hbGl6ZWRTdGF0dXNlcyA9IGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIGhhc0Vycm9yID0gX2EuaGFzRXJyb3IsIHRocm93bkVycm9yID0gX2EudGhyb3duRXJyb3IsIGlzU3RvcHBlZCA9IF9hLmlzU3RvcHBlZDtcbiAgICAgICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmVycm9yKHRocm93bkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3ViamVjdC5wcm90b3R5cGUuYXNPYnNlcnZhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIG9ic2VydmFibGUuc291cmNlID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGU7XG4gICAgfTtcbiAgICBTdWJqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgQW5vbnltb3VzU3ViamVjdChkZXN0aW5hdGlvbiwgc291cmNlKTtcbiAgICB9O1xuICAgIHJldHVybiBTdWJqZWN0O1xufShPYnNlcnZhYmxlKSk7XG5leHBvcnQgeyBTdWJqZWN0IH07XG52YXIgQW5vbnltb3VzU3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFub255bW91c1N1YmplY3QsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQW5vbnltb3VzU3ViamVjdChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XG4gICAgICAgIF90aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIChfYiA9IChfYSA9IHRoaXMuZGVzdGluYXRpb24pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uZXh0KSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSwgdmFsdWUpO1xuICAgIH07XG4gICAgQW5vbnltb3VzU3ViamVjdC5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIChfYiA9IChfYSA9IHRoaXMuZGVzdGluYXRpb24pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lcnJvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNhbGwoX2EsIGVycik7XG4gICAgfTtcbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgKF9iID0gKF9hID0gdGhpcy5kZXN0aW5hdGlvbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNvbXBsZXRlKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSk7XG4gICAgfTtcbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgcmV0dXJuIChfYiA9IChfYSA9IHRoaXMuc291cmNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3Vic2NyaWJlKHN1YnNjcmliZXIpKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBFTVBUWV9TVUJTQ1JJUFRJT047XG4gICAgfTtcbiAgICByZXR1cm4gQW5vbnltb3VzU3ViamVjdDtcbn0oU3ViamVjdCkpO1xuZXhwb3J0IHsgQW5vbnltb3VzU3ViamVjdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U3ViamVjdC5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGNyZWF0ZU9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBtYXAocHJvamVjdCwgdGhpc0FyZykge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShjcmVhdGVPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQocHJvamVjdC5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCsrKSk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuLy8gR2VuZXJhdGVkIFR5cGVTY3JpcHQgaW50ZXJmYWNlcyBhbmQgdHlwZXMuXHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gS2VybmVsIENvbW1hbmRzXHJcblxyXG5leHBvcnQgY29uc3QgQWRkUGFja2FnZVR5cGUgPSBcIkFkZFBhY2thZ2VcIjtcclxuZXhwb3J0IGNvbnN0IENhbmNlbFR5cGUgPSBcIkNhbmNlbFwiO1xyXG5leHBvcnQgY29uc3QgQ2hhbmdlV29ya2luZ0RpcmVjdG9yeVR5cGUgPSBcIkNoYW5nZVdvcmtpbmdEaXJlY3RvcnlcIjtcclxuZXhwb3J0IGNvbnN0IENvbXBpbGVQcm9qZWN0VHlwZSA9IFwiQ29tcGlsZVByb2plY3RcIjtcclxuZXhwb3J0IGNvbnN0IERpc3BsYXlFcnJvclR5cGUgPSBcIkRpc3BsYXlFcnJvclwiO1xyXG5leHBvcnQgY29uc3QgRGlzcGxheVZhbHVlVHlwZSA9IFwiRGlzcGxheVZhbHVlXCI7XHJcbmV4cG9ydCBjb25zdCBPcGVuRG9jdW1lbnRUeXBlID0gXCJPcGVuRG9jdW1lbnRcIjtcclxuZXhwb3J0IGNvbnN0IE9wZW5Qcm9qZWN0VHlwZSA9IFwiT3BlblByb2plY3RcIjtcclxuZXhwb3J0IGNvbnN0IFF1aXRUeXBlID0gXCJRdWl0XCI7XHJcbmV4cG9ydCBjb25zdCBSZXF1ZXN0Q29tcGxldGlvbnNUeXBlID0gXCJSZXF1ZXN0Q29tcGxldGlvbnNcIjtcclxuZXhwb3J0IGNvbnN0IFJlcXVlc3REaWFnbm9zdGljc1R5cGUgPSBcIlJlcXVlc3REaWFnbm9zdGljc1wiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdEhvdmVyVGV4dFR5cGUgPSBcIlJlcXVlc3RIb3ZlclRleHRcIjtcclxuZXhwb3J0IGNvbnN0IFJlcXVlc3RJbnB1dFR5cGUgPSBcIlJlcXVlc3RJbnB1dFwiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdEtlcm5lbEluZm9UeXBlID0gXCJSZXF1ZXN0S2VybmVsSW5mb1wiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdFNpZ25hdHVyZUhlbHBUeXBlID0gXCJSZXF1ZXN0U2lnbmF0dXJlSGVscFwiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdFZhbHVlVHlwZSA9IFwiUmVxdWVzdFZhbHVlXCI7XHJcbmV4cG9ydCBjb25zdCBSZXF1ZXN0VmFsdWVJbmZvc1R5cGUgPSBcIlJlcXVlc3RWYWx1ZUluZm9zXCI7XHJcbmV4cG9ydCBjb25zdCBTZW5kRWRpdGFibGVDb2RlVHlwZSA9IFwiU2VuZEVkaXRhYmxlQ29kZVwiO1xyXG5leHBvcnQgY29uc3QgU3VibWl0Q29kZVR5cGUgPSBcIlN1Ym1pdENvZGVcIjtcclxuZXhwb3J0IGNvbnN0IFVwZGF0ZURpc3BsYXllZFZhbHVlVHlwZSA9IFwiVXBkYXRlRGlzcGxheWVkVmFsdWVcIjtcclxuXHJcbmV4cG9ydCB0eXBlIEtlcm5lbENvbW1hbmRUeXBlID1cclxuICAgICAgdHlwZW9mIEFkZFBhY2thZ2VUeXBlXHJcbiAgICB8IHR5cGVvZiBDYW5jZWxUeXBlXHJcbiAgICB8IHR5cGVvZiBDaGFuZ2VXb3JraW5nRGlyZWN0b3J5VHlwZVxyXG4gICAgfCB0eXBlb2YgQ29tcGlsZVByb2plY3RUeXBlXHJcbiAgICB8IHR5cGVvZiBEaXNwbGF5RXJyb3JUeXBlXHJcbiAgICB8IHR5cGVvZiBEaXNwbGF5VmFsdWVUeXBlXHJcbiAgICB8IHR5cGVvZiBPcGVuRG9jdW1lbnRUeXBlXHJcbiAgICB8IHR5cGVvZiBPcGVuUHJvamVjdFR5cGVcclxuICAgIHwgdHlwZW9mIFF1aXRUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0Q29tcGxldGlvbnNUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0RGlhZ25vc3RpY3NUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0SG92ZXJUZXh0VHlwZVxyXG4gICAgfCB0eXBlb2YgUmVxdWVzdElucHV0VHlwZVxyXG4gICAgfCB0eXBlb2YgUmVxdWVzdEtlcm5lbEluZm9UeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0U2lnbmF0dXJlSGVscFR5cGVcclxuICAgIHwgdHlwZW9mIFJlcXVlc3RWYWx1ZVR5cGVcclxuICAgIHwgdHlwZW9mIFJlcXVlc3RWYWx1ZUluZm9zVHlwZVxyXG4gICAgfCB0eXBlb2YgU2VuZEVkaXRhYmxlQ29kZVR5cGVcclxuICAgIHwgdHlwZW9mIFN1Ym1pdENvZGVUeXBlXHJcbiAgICB8IHR5cGVvZiBVcGRhdGVEaXNwbGF5ZWRWYWx1ZVR5cGU7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFkZFBhY2thZ2UgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxuICAgIHBhY2thZ2VSZWZlcmVuY2U6IFBhY2thZ2VSZWZlcmVuY2U7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsQ29tbWFuZCB7XHJcbiAgICB0YXJnZXRLZXJuZWxOYW1lPzogc3RyaW5nO1xyXG4gICAgb3JpZ2luVXJpPzogc3RyaW5nO1xyXG4gICAgZGVzdGluYXRpb25Vcmk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbmdlV29ya2luZ0RpcmVjdG9yeSBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG4gICAgd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVQcm9qZWN0IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUVycm9yIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheVZhbHVlIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBmb3JtYXR0ZWRWYWx1ZTogRm9ybWF0dGVkVmFsdWU7XHJcbiAgICB2YWx1ZUlkOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3BlbkRvY3VtZW50IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICByZWxhdGl2ZUZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICByZWdpb25OYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9wZW5Qcm9qZWN0IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBwcm9qZWN0OiBQcm9qZWN0O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFF1aXQgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0Q29tcGxldGlvbnMgZXh0ZW5kcyBMYW5ndWFnZVNlcnZpY2VDb21tYW5kIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMYW5ndWFnZVNlcnZpY2VDb21tYW5kIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbiAgICBsaW5lUG9zaXRpb246IExpbmVQb3NpdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RGlhZ25vc3RpY3MgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxuICAgIGNvZGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0SG92ZXJUZXh0IGV4dGVuZHMgTGFuZ3VhZ2VTZXJ2aWNlQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdElucHV0IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBwcm9tcHQ6IHN0cmluZztcclxuICAgIGlzUGFzc3dvcmQ6IGJvb2xlYW47XHJcbiAgICBpbnB1dFR5cGVIaW50OiBzdHJpbmc7XHJcbiAgICB2YWx1ZU5hbWU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0S2VybmVsSW5mbyBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RTaWduYXR1cmVIZWxwIGV4dGVuZHMgTGFuZ3VhZ2VTZXJ2aWNlQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdFZhbHVlIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBtaW1lVHlwZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RWYWx1ZUluZm9zIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2VuZEVkaXRhYmxlQ29kZSBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG4gICAgbGFuZ3VhZ2U6IHN0cmluZztcclxuICAgIGNvZGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdWJtaXRDb2RlIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbiAgICBzdWJtaXNzaW9uVHlwZT86IFN1Ym1pc3Npb25UeXBlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZURpc3BsYXllZFZhbHVlIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBmb3JtYXR0ZWRWYWx1ZTogRm9ybWF0dGVkVmFsdWU7XHJcbiAgICB2YWx1ZUlkOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXlFbGVtZW50IGV4dGVuZHMgSW50ZXJhY3RpdmVEb2N1bWVudE91dHB1dEVsZW1lbnQge1xyXG4gICAgZGF0YTogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XHJcbiAgICBtZXRhZGF0YTogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3RpdmVEb2N1bWVudE91dHB1dEVsZW1lbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJldHVyblZhbHVlRWxlbWVudCBleHRlbmRzIEludGVyYWN0aXZlRG9jdW1lbnRPdXRwdXRFbGVtZW50IHtcclxuICAgIGRhdGE6IHsgW2tleTogc3RyaW5nXTogYW55OyB9O1xyXG4gICAgZXhlY3V0aW9uT3JkZXI6IG51bWJlcjtcclxuICAgIG1ldGFkYXRhOiB7IFtrZXk6IHN0cmluZ106IGFueTsgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUZXh0RWxlbWVudCBleHRlbmRzIEludGVyYWN0aXZlRG9jdW1lbnRPdXRwdXRFbGVtZW50IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHRleHQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFcnJvckVsZW1lbnQgZXh0ZW5kcyBJbnRlcmFjdGl2ZURvY3VtZW50T3V0cHV0RWxlbWVudCB7XHJcbiAgICBlcnJvck5hbWU6IHN0cmluZztcclxuICAgIGVycm9yVmFsdWU6IHN0cmluZztcclxuICAgIHN0YWNrVHJhY2U6IEFycmF5PHN0cmluZz47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm90ZWJvb2tQYXJzZVJlcXVlc3QgZXh0ZW5kcyBOb3RlYm9va1BhcnNlT3JTZXJpYWxpemVSZXF1ZXN0IHtcclxuICAgIHR5cGU6IFJlcXVlc3RUeXBlO1xyXG4gICAgcmF3RGF0YTogVWludDhBcnJheTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBOb3RlYm9va1BhcnNlT3JTZXJpYWxpemVSZXF1ZXN0IHtcclxuICAgIHR5cGU6IFJlcXVlc3RUeXBlO1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIHNlcmlhbGl6YXRpb25UeXBlOiBEb2N1bWVudFNlcmlhbGl6YXRpb25UeXBlO1xyXG4gICAgZGVmYXVsdExhbmd1YWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm90ZWJvb2tTZXJpYWxpemVSZXF1ZXN0IGV4dGVuZHMgTm90ZWJvb2tQYXJzZU9yU2VyaWFsaXplUmVxdWVzdCB7XHJcbiAgICB0eXBlOiBSZXF1ZXN0VHlwZTtcclxuICAgIG5ld0xpbmU6IHN0cmluZztcclxuICAgIGRvY3VtZW50OiBJbnRlcmFjdGl2ZURvY3VtZW50O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vdGVib29rUGFyc2VSZXNwb25zZSBleHRlbmRzIE5vdGVib29rUGFyc2VyU2VydmVyUmVzcG9uc2Uge1xyXG4gICAgZG9jdW1lbnQ6IEludGVyYWN0aXZlRG9jdW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm90ZWJvb2tQYXJzZXJTZXJ2ZXJSZXNwb25zZSB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vdGVib29rU2VyaWFsaXplUmVzcG9uc2UgZXh0ZW5kcyBOb3RlYm9va1BhcnNlclNlcnZlclJlc3BvbnNlIHtcclxuICAgIHJhd0RhdGE6IFVpbnQ4QXJyYXk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm90ZWJvb2tFcnJvclJlc3BvbnNlIGV4dGVuZHMgTm90ZWJvb2tQYXJzZXJTZXJ2ZXJSZXNwb25zZSB7XHJcbiAgICBlcnJvck1lc3NhZ2U6IHN0cmluZztcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEtlcm5lbCBldmVudHNcclxuXHJcbmV4cG9ydCBjb25zdCBBc3NlbWJseVByb2R1Y2VkVHlwZSA9IFwiQXNzZW1ibHlQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFR5cGUgPSBcIkNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRcIjtcclxuZXhwb3J0IGNvbnN0IENvbW1hbmRDYW5jZWxsZWRUeXBlID0gXCJDb21tYW5kQ2FuY2VsbGVkXCI7XHJcbmV4cG9ydCBjb25zdCBDb21tYW5kRmFpbGVkVHlwZSA9IFwiQ29tbWFuZEZhaWxlZFwiO1xyXG5leHBvcnQgY29uc3QgQ29tbWFuZFN1Y2NlZWRlZFR5cGUgPSBcIkNvbW1hbmRTdWNjZWVkZWRcIjtcclxuZXhwb3J0IGNvbnN0IENvbXBsZXRlQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFR5cGUgPSBcIkNvbXBsZXRlQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFwiO1xyXG5leHBvcnQgY29uc3QgQ29tcGxldGlvbnNQcm9kdWNlZFR5cGUgPSBcIkNvbXBsZXRpb25zUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IERpYWdub3N0aWNMb2dFbnRyeVByb2R1Y2VkVHlwZSA9IFwiRGlhZ25vc3RpY0xvZ0VudHJ5UHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IERpYWdub3N0aWNzUHJvZHVjZWRUeXBlID0gXCJEaWFnbm9zdGljc1Byb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBEaXNwbGF5ZWRWYWx1ZVByb2R1Y2VkVHlwZSA9IFwiRGlzcGxheWVkVmFsdWVQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgRGlzcGxheWVkVmFsdWVVcGRhdGVkVHlwZSA9IFwiRGlzcGxheWVkVmFsdWVVcGRhdGVkXCI7XHJcbmV4cG9ydCBjb25zdCBEb2N1bWVudE9wZW5lZFR5cGUgPSBcIkRvY3VtZW50T3BlbmVkXCI7XHJcbmV4cG9ydCBjb25zdCBFcnJvclByb2R1Y2VkVHlwZSA9IFwiRXJyb3JQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgSG92ZXJUZXh0UHJvZHVjZWRUeXBlID0gXCJIb3ZlclRleHRQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgSW5jb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlID0gXCJJbmNvbXBsZXRlQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFwiO1xyXG5leHBvcnQgY29uc3QgSW5wdXRQcm9kdWNlZFR5cGUgPSBcIklucHV0UHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IEtlcm5lbEV4dGVuc2lvbkxvYWRlZFR5cGUgPSBcIktlcm5lbEV4dGVuc2lvbkxvYWRlZFwiO1xyXG5leHBvcnQgY29uc3QgS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSA9IFwiS2VybmVsSW5mb1Byb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBLZXJuZWxSZWFkeVR5cGUgPSBcIktlcm5lbFJlYWR5XCI7XHJcbmV4cG9ydCBjb25zdCBQYWNrYWdlQWRkZWRUeXBlID0gXCJQYWNrYWdlQWRkZWRcIjtcclxuZXhwb3J0IGNvbnN0IFByb2plY3RPcGVuZWRUeXBlID0gXCJQcm9qZWN0T3BlbmVkXCI7XHJcbmV4cG9ydCBjb25zdCBSZXR1cm5WYWx1ZVByb2R1Y2VkVHlwZSA9IFwiUmV0dXJuVmFsdWVQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgU2lnbmF0dXJlSGVscFByb2R1Y2VkVHlwZSA9IFwiU2lnbmF0dXJlSGVscFByb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBTdGFuZGFyZEVycm9yVmFsdWVQcm9kdWNlZFR5cGUgPSBcIlN0YW5kYXJkRXJyb3JWYWx1ZVByb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBTdGFuZGFyZE91dHB1dFZhbHVlUHJvZHVjZWRUeXBlID0gXCJTdGFuZGFyZE91dHB1dFZhbHVlUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IFZhbHVlSW5mb3NQcm9kdWNlZFR5cGUgPSBcIlZhbHVlSW5mb3NQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgVmFsdWVQcm9kdWNlZFR5cGUgPSBcIlZhbHVlUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IFdvcmtpbmdEaXJlY3RvcnlDaGFuZ2VkVHlwZSA9IFwiV29ya2luZ0RpcmVjdG9yeUNoYW5nZWRcIjtcclxuXHJcbmV4cG9ydCB0eXBlIEtlcm5lbEV2ZW50VHlwZSA9XHJcbiAgICAgIHR5cGVvZiBBc3NlbWJseVByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFR5cGVcclxuICAgIHwgdHlwZW9mIENvbW1hbmRDYW5jZWxsZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBDb21tYW5kRmFpbGVkVHlwZVxyXG4gICAgfCB0eXBlb2YgQ29tbWFuZFN1Y2NlZWRlZFR5cGVcclxuICAgIHwgdHlwZW9mIENvbXBsZXRlQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFR5cGVcclxuICAgIHwgdHlwZW9mIENvbXBsZXRpb25zUHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBEaWFnbm9zdGljTG9nRW50cnlQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIERpYWdub3N0aWNzUHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBEaXNwbGF5ZWRWYWx1ZVByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgRGlzcGxheWVkVmFsdWVVcGRhdGVkVHlwZVxyXG4gICAgfCB0eXBlb2YgRG9jdW1lbnRPcGVuZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBFcnJvclByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgSG92ZXJUZXh0UHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBJbmNvbXBsZXRlQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFR5cGVcclxuICAgIHwgdHlwZW9mIElucHV0UHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBLZXJuZWxFeHRlbnNpb25Mb2FkZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBLZXJuZWxJbmZvUHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBLZXJuZWxSZWFkeVR5cGVcclxuICAgIHwgdHlwZW9mIFBhY2thZ2VBZGRlZFR5cGVcclxuICAgIHwgdHlwZW9mIFByb2plY3RPcGVuZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXR1cm5WYWx1ZVByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgU2lnbmF0dXJlSGVscFByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgU3RhbmRhcmRFcnJvclZhbHVlUHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBTdGFuZGFyZE91dHB1dFZhbHVlUHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBWYWx1ZUluZm9zUHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBWYWx1ZVByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgV29ya2luZ0RpcmVjdG9yeUNoYW5nZWRUeXBlO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBc3NlbWJseVByb2R1Y2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgYXNzZW1ibHk6IEJhc2U2NEVuY29kZWRBc3NlbWJseTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb2RlU3VibWlzc2lvblJlY2VpdmVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgY29kZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRDYW5jZWxsZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZEZhaWxlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kU3VjY2VlZGVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbXBsZXRlQ29kZVN1Ym1pc3Npb25SZWNlaXZlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGNvZGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0aW9uc1Byb2R1Y2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgbGluZVBvc2l0aW9uU3Bhbj86IExpbmVQb3NpdGlvblNwYW47XHJcbiAgICBjb21wbGV0aW9uczogQXJyYXk8Q29tcGxldGlvbkl0ZW0+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3N0aWNMb2dFbnRyeVByb2R1Y2VkIGV4dGVuZHMgRGlhZ25vc3RpY0V2ZW50IHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEaWFnbm9zdGljRXZlbnQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc3RpY3NQcm9kdWNlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGRpYWdub3N0aWNzOiBBcnJheTxEaWFnbm9zdGljPjtcclxuICAgIGZvcm1hdHRlZERpYWdub3N0aWNzOiBBcnJheTxGb3JtYXR0ZWRWYWx1ZT47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheWVkVmFsdWVQcm9kdWNlZCBleHRlbmRzIERpc3BsYXlFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUV2ZW50IGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgZm9ybWF0dGVkVmFsdWVzOiBBcnJheTxGb3JtYXR0ZWRWYWx1ZT47XHJcbiAgICB2YWx1ZUlkPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXllZFZhbHVlVXBkYXRlZCBleHRlbmRzIERpc3BsYXlFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9jdW1lbnRPcGVuZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICByZWxhdGl2ZUZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICByZWdpb25OYW1lPzogc3RyaW5nO1xyXG4gICAgY29udGVudDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yUHJvZHVjZWQgZXh0ZW5kcyBEaXNwbGF5RXZlbnQge1xyXG4gICAgbWVzc2FnZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEhvdmVyVGV4dFByb2R1Y2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgY29udGVudDogQXJyYXk8Rm9ybWF0dGVkVmFsdWU+O1xyXG4gICAgbGluZVBvc2l0aW9uU3Bhbj86IExpbmVQb3NpdGlvblNwYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW5jb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW5wdXRQcm9kdWNlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIHZhbHVlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsRXh0ZW5zaW9uTG9hZGVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbEluZm9Qcm9kdWNlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGtlcm5lbEluZm86IEtlcm5lbEluZm87XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsUmVhZHkgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGFja2FnZUFkZGVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgcGFja2FnZVJlZmVyZW5jZTogUmVzb2x2ZWRQYWNrYWdlUmVmZXJlbmNlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb2plY3RPcGVuZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBwcm9qZWN0SXRlbXM6IEFycmF5PFByb2plY3RJdGVtPjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXR1cm5WYWx1ZVByb2R1Y2VkIGV4dGVuZHMgRGlzcGxheUV2ZW50IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTaWduYXR1cmVIZWxwUHJvZHVjZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBzaWduYXR1cmVzOiBBcnJheTxTaWduYXR1cmVJbmZvcm1hdGlvbj47XHJcbiAgICBhY3RpdmVTaWduYXR1cmVJbmRleDogbnVtYmVyO1xyXG4gICAgYWN0aXZlUGFyYW1ldGVySW5kZXg6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdGFuZGFyZEVycm9yVmFsdWVQcm9kdWNlZCBleHRlbmRzIERpc3BsYXlFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3RhbmRhcmRPdXRwdXRWYWx1ZVByb2R1Y2VkIGV4dGVuZHMgRGlzcGxheUV2ZW50IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBWYWx1ZUluZm9zUHJvZHVjZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICB2YWx1ZUluZm9zOiBBcnJheTxLZXJuZWxWYWx1ZUluZm8+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFZhbHVlUHJvZHVjZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBmb3JtYXR0ZWRWYWx1ZTogRm9ybWF0dGVkVmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV29ya2luZ0RpcmVjdG9yeUNoYW5nZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICB3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZXF1aXJlZCBUeXBlc1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCYXNlNjRFbmNvZGVkQXNzZW1ibHkge1xyXG4gICAgdmFsdWU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0aW9uSXRlbSB7XHJcbiAgICBkaXNwbGF5VGV4dDogc3RyaW5nO1xyXG4gICAga2luZDogc3RyaW5nO1xyXG4gICAgZmlsdGVyVGV4dDogc3RyaW5nO1xyXG4gICAgc29ydFRleHQ6IHN0cmluZztcclxuICAgIGluc2VydFRleHQ6IHN0cmluZztcclxuICAgIGluc2VydFRleHRGb3JtYXQ/OiBJbnNlcnRUZXh0Rm9ybWF0O1xyXG4gICAgZG9jdW1lbnRhdGlvbjogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBJbnNlcnRUZXh0Rm9ybWF0IHtcclxuICAgIFBsYWluVGV4dCA9IFwicGxhaW50ZXh0XCIsXHJcbiAgICBTbmlwcGV0ID0gXCJzbmlwcGV0XCIsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc3RpYyB7XHJcbiAgICBsaW5lUG9zaXRpb25TcGFuOiBMaW5lUG9zaXRpb25TcGFuO1xyXG4gICAgc2V2ZXJpdHk6IERpYWdub3N0aWNTZXZlcml0eTtcclxuICAgIGNvZGU6IHN0cmluZztcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGVudW0gRGlhZ25vc3RpY1NldmVyaXR5IHtcclxuICAgIEhpZGRlbiA9IFwiaGlkZGVuXCIsXHJcbiAgICBJbmZvID0gXCJpbmZvXCIsXHJcbiAgICBXYXJuaW5nID0gXCJ3YXJuaW5nXCIsXHJcbiAgICBFcnJvciA9IFwiZXJyb3JcIixcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5lUG9zaXRpb25TcGFuIHtcclxuICAgIHN0YXJ0OiBMaW5lUG9zaXRpb247XHJcbiAgICBlbmQ6IExpbmVQb3NpdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5lUG9zaXRpb24ge1xyXG4gICAgbGluZTogbnVtYmVyO1xyXG4gICAgY2hhcmFjdGVyOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIERvY3VtZW50U2VyaWFsaXphdGlvblR5cGUge1xyXG4gICAgRGliID0gXCJkaWJcIixcclxuICAgIElweW5iID0gXCJpcHluYlwiLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1hdHRlZFZhbHVlIHtcclxuICAgIG1pbWVUeXBlOiBzdHJpbmc7XHJcbiAgICB2YWx1ZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEludGVyYWN0aXZlRG9jdW1lbnQge1xyXG4gICAgZWxlbWVudHM6IEFycmF5PEludGVyYWN0aXZlRG9jdW1lbnRFbGVtZW50PjtcclxuICAgIG1ldGFkYXRhOiB7IFtrZXk6IHN0cmluZ106IGFueTsgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGl2ZURvY3VtZW50RWxlbWVudCB7XHJcbiAgICBpZD86IHN0cmluZztcclxuICAgIGtlcm5lbE5hbWU/OiBzdHJpbmc7XHJcbiAgICBjb250ZW50czogc3RyaW5nO1xyXG4gICAgb3V0cHV0czogQXJyYXk8SW50ZXJhY3RpdmVEb2N1bWVudE91dHB1dEVsZW1lbnQ+O1xyXG4gICAgZXhlY3V0aW9uT3JkZXI6IG51bWJlcjtcclxuICAgIG1ldGFkYXRhPzogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsSW5mbyB7XHJcbiAgICBhbGlhc2VzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgbGFuZ3VhZ2VOYW1lPzogc3RyaW5nO1xyXG4gICAgbGFuZ3VhZ2VWZXJzaW9uPzogc3RyaW5nO1xyXG4gICAgbG9jYWxOYW1lOiBzdHJpbmc7XHJcbiAgICB1cmk/OiBzdHJpbmc7XHJcbiAgICByZW1vdGVVcmk/OiBzdHJpbmc7XHJcbiAgICBzdXBwb3J0ZWRLZXJuZWxDb21tYW5kczogQXJyYXk8S2VybmVsQ29tbWFuZEluZm8+O1xyXG4gICAgc3VwcG9ydGVkRGlyZWN0aXZlczogQXJyYXk8S2VybmVsRGlyZWN0aXZlSW5mbz47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsQ29tbWFuZEluZm8ge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbERpcmVjdGl2ZUluZm8ge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbFZhbHVlSW5mbyB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBwcmVmZXJyZWRNaW1lVHlwZXM6IEFycmF5PHN0cmluZz47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGFja2FnZVJlZmVyZW5jZSB7XHJcbiAgICBwYWNrYWdlTmFtZTogc3RyaW5nO1xyXG4gICAgcGFja2FnZVZlcnNpb246IHN0cmluZztcclxuICAgIGlzUGFja2FnZVZlcnNpb25TcGVjaWZpZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUHJvamVjdCB7XHJcbiAgICBmaWxlczogQXJyYXk8UHJvamVjdEZpbGU+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb2plY3RGaWxlIHtcclxuICAgIHJlbGF0aXZlRmlsZVBhdGg6IHN0cmluZztcclxuICAgIGNvbnRlbnQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0SXRlbSB7XHJcbiAgICByZWxhdGl2ZUZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICByZWdpb25OYW1lczogQXJyYXk8c3RyaW5nPjtcclxuICAgIHJlZ2lvbnNDb250ZW50OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfTtcclxufVxyXG5cclxuZXhwb3J0IGVudW0gUmVxdWVzdFR5cGUge1xyXG4gICAgUGFyc2UgPSBcInBhcnNlXCIsXHJcbiAgICBTZXJpYWxpemUgPSBcInNlcmlhbGl6ZVwiLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkUGFja2FnZVJlZmVyZW5jZSBleHRlbmRzIFBhY2thZ2VSZWZlcmVuY2Uge1xyXG4gICAgYXNzZW1ibHlQYXRoczogQXJyYXk8c3RyaW5nPjtcclxuICAgIHByb2JpbmdQYXRoczogQXJyYXk8c3RyaW5nPjtcclxuICAgIHBhY2thZ2VSb290OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmF0dXJlSW5mb3JtYXRpb24ge1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIGRvY3VtZW50YXRpb246IEZvcm1hdHRlZFZhbHVlO1xyXG4gICAgcGFyYW1ldGVyczogQXJyYXk8UGFyYW1ldGVySW5mb3JtYXRpb24+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBhcmFtZXRlckluZm9ybWF0aW9uIHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBkb2N1bWVudGF0aW9uOiBGb3JtYXR0ZWRWYWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGVudW0gU3VibWlzc2lvblR5cGUge1xyXG4gICAgUnVuID0gXCJydW5cIixcclxuICAgIERpYWdub3NlID0gXCJkaWFnbm9zZVwiLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbEV2ZW50RW52ZWxvcGUge1xyXG4gICAgZXZlbnRUeXBlOiBLZXJuZWxFdmVudFR5cGU7XHJcbiAgICBldmVudDogS2VybmVsRXZlbnQ7XHJcbiAgICBjb21tYW5kPzogS2VybmVsQ29tbWFuZEVudmVsb3BlO1xyXG4gICAgcm91dGluZ1NsaXA/OiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLZXJuZWxDb21tYW5kRW52ZWxvcGUge1xyXG4gICAgdG9rZW4/OiBzdHJpbmc7XHJcbiAgICBpZD86IHN0cmluZztcclxuICAgIGNvbW1hbmRUeXBlOiBLZXJuZWxDb21tYW5kVHlwZTtcclxuICAgIGNvbW1hbmQ6IEtlcm5lbENvbW1hbmQ7XHJcbiAgICByb3V0aW5nU2xpcD86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbEV2ZW50RW52ZWxvcGVPYnNlcnZlciB7XHJcbiAgICAoZXZlbnRFbnZlbG9wZTogS2VybmVsRXZlbnRFbnZlbG9wZSk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsQ29tbWFuZEVudmVsb3BlSGFuZGxlciB7XHJcbiAgICAoZXZlbnRFbnZlbG9wZTogS2VybmVsQ29tbWFuZEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPjtcclxufSIsIi8vIENvcHlyaWdodCAoYykgLk5FVCBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcHJvamVjdCByb290IGZvciBmdWxsIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlQ29tcGxldGlvblNvdXJjZTxUPihvYmo6IGFueSk6IG9iaiBpcyBQcm9taXNlQ29tcGxldGlvblNvdXJjZTxUPiB7XHJcbiAgICByZXR1cm4gb2JqLnByb21pc2VcclxuICAgICAgICAmJiBvYmoucmVzb2x2ZVxyXG4gICAgICAgICYmIG9iai5yZWplY3Q7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQcm9taXNlQ29tcGxldGlvblNvdXJjZTxUPiB7XHJcbiAgICBwcml2YXRlIF9yZXNvbHZlOiAodmFsdWU6IFQpID0+IHZvaWQgPSAoKSA9PiB7IH07XHJcbiAgICBwcml2YXRlIF9yZWplY3Q6IChyZWFzb246IGFueSkgPT4gdm9pZCA9ICgpID0+IHsgfTtcclxuICAgIHJlYWRvbmx5IHByb21pc2U6IFByb21pc2U8VD47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgICAgICAgdGhpcy5fcmVqZWN0ID0gcmVqZWN0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc29sdmUodmFsdWU6IFQpIHtcclxuICAgICAgICB0aGlzLl9yZXNvbHZlKHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZWplY3QocmVhc29uOiBhbnkpIHtcclxuICAgICAgICB0aGlzLl9yZWplY3QocmVhc29uKTtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgcnhqcyBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwIH0gZnJvbSBcIi4vY29ubmVjdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBjb250cmFjdHMgZnJvbSBcIi4vY29udHJhY3RzXCI7XHJcbmltcG9ydCB7IERpc3Bvc2FibGUgfSBmcm9tIFwiLi9kaXNwb3NhYmxlc1wiO1xyXG5pbXBvcnQgeyBnZXRLZXJuZWxVcmksIEtlcm5lbCB9IGZyb20gXCIuL2tlcm5lbFwiO1xyXG5pbXBvcnQgeyBQcm9taXNlQ29tcGxldGlvblNvdXJjZSB9IGZyb20gXCIuL3Byb21pc2VDb21wbGV0aW9uU291cmNlXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEtlcm5lbEludm9jYXRpb25Db250ZXh0IGltcGxlbWVudHMgRGlzcG9zYWJsZSB7XHJcbiAgICBwdWJsaWMgZ2V0IHByb21pc2UoKTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wbGV0aW9uU291cmNlLnByb21pc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY3VycmVudDogS2VybmVsSW52b2NhdGlvbkNvbnRleHQgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZTtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NoaWxkQ29tbWFuZHM6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGVbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZXZlbnRTdWJqZWN0OiByeGpzLlN1YmplY3Q8Y29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGU+ID0gbmV3IHJ4anMuU3ViamVjdDxjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZT4oKTtcclxuXHJcbiAgICBwcml2YXRlIF9pc0NvbXBsZXRlID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9oYW5kbGluZ0tlcm5lbDogS2VybmVsIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIGdldCBoYW5kbGluZ0tlcm5lbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxpbmdLZXJuZWw7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnZXQga2VybmVsRXZlbnRzKCk6IHJ4anMuT2JzZXJ2YWJsZTxjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBzZXQgaGFuZGxpbmdLZXJuZWwodmFsdWU6IEtlcm5lbCB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGluZ0tlcm5lbCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcGxldGlvblNvdXJjZSA9IG5ldyBQcm9taXNlQ29tcGxldGlvblNvdXJjZTx2b2lkPigpO1xyXG4gICAgc3RhdGljIGVzdGFibGlzaChrZXJuZWxDb21tYW5kSW52b2NhdGlvbjogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IEtlcm5lbEludm9jYXRpb25Db250ZXh0IHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IEtlcm5lbEludm9jYXRpb25Db250ZXh0Ll9jdXJyZW50O1xyXG4gICAgICAgIGlmICghY3VycmVudCB8fCBjdXJyZW50Ll9pc0NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgIEtlcm5lbEludm9jYXRpb25Db250ZXh0Ll9jdXJyZW50ID0gbmV3IEtlcm5lbEludm9jYXRpb25Db250ZXh0KGtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIWFyZUNvbW1hbmRzVGhlU2FtZShrZXJuZWxDb21tYW5kSW52b2NhdGlvbiwgY3VycmVudC5fY29tbWFuZEVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSBjdXJyZW50Ll9jaGlsZENvbW1hbmRzLmluY2x1ZGVzKGtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmICghZm91bmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Ll9jaGlsZENvbW1hbmRzLnB1c2goa2VybmVsQ29tbWFuZEludm9jYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRTbGlwID0ga2VybmVsQ29tbWFuZEludm9jYXRpb24ucm91dGluZ1NsaXAgPz8gW107XHJcbiAgICAgICAgICAgICAgICAgICAga2VybmVsQ29tbWFuZEludm9jYXRpb24ucm91dGluZ1NsaXAgPSBbLi4uKGN1cnJlbnQuX2NvbW1hbmRFbnZlbG9wZS5yb3V0aW5nU2xpcCA/PyBbXSldO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdXJpIG9mIG9sZFNsaXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcChrZXJuZWxDb21tYW5kSW52b2NhdGlvbiwgdXJpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5fY3VycmVudCE7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBjdXJyZW50KCk6IEtlcm5lbEludm9jYXRpb25Db250ZXh0IHwgbnVsbCB7IHJldHVybiB0aGlzLl9jdXJyZW50OyB9XHJcbiAgICBnZXQgY29tbWFuZCgpOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZCB7IHJldHVybiB0aGlzLl9jb21tYW5kRW52ZWxvcGUuY29tbWFuZDsgfVxyXG4gICAgZ2V0IGNvbW1hbmRFbnZlbG9wZSgpOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlIHsgcmV0dXJuIHRoaXMuX2NvbW1hbmRFbnZlbG9wZTsgfVxyXG4gICAgY29uc3RydWN0b3Ioa2VybmVsQ29tbWFuZEludm9jYXRpb246IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUpIHtcclxuICAgICAgICB0aGlzLl9jb21tYW5kRW52ZWxvcGUgPSBrZXJuZWxDb21tYW5kSW52b2NhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBjb21wbGV0ZShjb21tYW5kOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKSB7XHJcbiAgICAgICAgaWYgKGFyZUNvbW1hbmRzVGhlU2FtZShjb21tYW5kLCB0aGlzLl9jb21tYW5kRW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBsZXQgc3VjY2VlZGVkOiBjb250cmFjdHMuQ29tbWFuZFN1Y2NlZWRlZCA9IHt9O1xyXG4gICAgICAgICAgICBsZXQgZXZlbnRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUgPSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kOiB0aGlzLl9jb21tYW5kRW52ZWxvcGUsXHJcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6IGNvbnRyYWN0cy5Db21tYW5kU3VjY2VlZGVkVHlwZSxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBzdWNjZWVkZWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbFB1Ymxpc2goZXZlbnRFbnZlbG9wZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGlvblNvdXJjZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IEMjIHZlcnNpb24gaGFzIGNvbXBsZXRpb24gY2FsbGJhY2tzIC0gZG8gd2UgbmVlZCB0aGVzZT9cclxuICAgICAgICAgICAgLy8gaWYgKCFfZXZlbnRzLklzRGlzcG9zZWQpXHJcbiAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgLy8gICAgIF9ldmVudHMuT25Db21wbGV0ZWQoKTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLl9jaGlsZENvbW1hbmRzLmluZGV4T2YoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9jaGlsZENvbW1hbmRzW3Bvc107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZhaWwobWVzc2FnZT86IHN0cmluZykge1xyXG4gICAgICAgIC8vIFRPRE86XHJcbiAgICAgICAgLy8gVGhlIEMjIGNvZGUgYWNjZXB0cyBhIG1lc3NhZ2UgYW5kL29yIGFuIGV4Y2VwdGlvbi4gRG8gd2UgbmVlZCB0byBhZGQgc3VwcG9ydFxyXG4gICAgICAgIC8vIGZvciBleGNlcHRpb25zPyAoVGhlIFRTIENvbW1hbmRGYWlsZWQgaW50ZXJmYWNlIGRvZXNuJ3QgaGF2ZSBhIHBsYWNlIGZvciBpdCByaWdodCBub3cuKVxyXG4gICAgICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgIGxldCBmYWlsZWQ6IGNvbnRyYWN0cy5Db21tYW5kRmFpbGVkID0geyBtZXNzYWdlOiBtZXNzYWdlID8/IFwiQ29tbWFuZCBGYWlsZWRcIiB9O1xyXG4gICAgICAgIGxldCBldmVudEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSA9IHtcclxuICAgICAgICAgICAgY29tbWFuZDogdGhpcy5fY29tbWFuZEVudmVsb3BlLFxyXG4gICAgICAgICAgICBldmVudFR5cGU6IGNvbnRyYWN0cy5Db21tYW5kRmFpbGVkVHlwZSxcclxuICAgICAgICAgICAgZXZlbnQ6IGZhaWxlZFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxQdWJsaXNoKGV2ZW50RW52ZWxvcGUpO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvblNvdXJjZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGlzaChrZXJuZWxFdmVudDogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQ29tcGxldGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbFB1Ymxpc2goa2VybmVsRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsUHVibGlzaChrZXJuZWxFdmVudDogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUpIHtcclxuICAgICAgICBpZiAoIWtlcm5lbEV2ZW50LmNvbW1hbmQpIHtcclxuICAgICAgICAgICAga2VybmVsRXZlbnQuY29tbWFuZCA9IHRoaXMuX2NvbW1hbmRFbnZlbG9wZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb21tYW5kID0ga2VybmVsRXZlbnQuY29tbWFuZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxpbmdLZXJuZWwpIHtcclxuICAgICAgICAgICAgdHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcChrZXJuZWxFdmVudCwgZ2V0S2VybmVsVXJpKHRoaXMuaGFuZGxpbmdLZXJuZWwpKTtcclxuICAgICAgICAgICAga2VybmVsRXZlbnQucm91dGluZ1NsaXA7Ly8/XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGtlcm5lbEV2ZW50Oy8vP1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jb21tYW5kRW52ZWxvcGU7Ly8/XHJcbiAgICAgICAgaWYgKGNvbW1hbmQgPT09IG51bGwgfHxcclxuICAgICAgICAgICAgY29tbWFuZCA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgIGFyZUNvbW1hbmRzVGhlU2FtZShjb21tYW5kISwgdGhpcy5fY29tbWFuZEVudmVsb3BlKSB8fFxyXG4gICAgICAgICAgICB0aGlzLl9jaGlsZENvbW1hbmRzLmluY2x1ZGVzKGNvbW1hbmQhKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudFN1YmplY3QubmV4dChrZXJuZWxFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzUGFyZW50T2ZDb21tYW5kKGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkRm91bmQgPSB0aGlzLl9jaGlsZENvbW1hbmRzLmluY2x1ZGVzKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgcmV0dXJuIGNoaWxkRm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQ29tcGxldGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZSh0aGlzLl9jb21tYW5kRW52ZWxvcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5fY3VycmVudCA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcmVDb21tYW5kc1RoZVNhbWUoZW52ZWxvcGUxOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlLCBlbnZlbG9wZTI6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUpOiBib29sZWFuIHtcclxuICAgIGVudmVsb3BlMTsvLz9cclxuICAgIGVudmVsb3BlMjsvLz9cclxuICAgIGVudmVsb3BlMSA9PT0gZW52ZWxvcGUyOy8vP1xyXG4gICAgcmV0dXJuIGVudmVsb3BlMSA9PT0gZW52ZWxvcGUyXHJcbiAgICAgICAgfHwgKGVudmVsb3BlMT8uY29tbWFuZFR5cGUgPT09IGVudmVsb3BlMj8uY29tbWFuZFR5cGUgJiYgZW52ZWxvcGUxPy50b2tlbiA9PT0gZW52ZWxvcGUyPy50b2tlbiAmJiBlbnZlbG9wZTE/LmlkID09PSBlbnZlbG9wZTI/LmlkKTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgS2VybmVsQ29tbWFuZEVudmVsb3BlIH0gZnJvbSBcIi4vY29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgR3VpZCB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyB2YWxpZGF0b3IgPSBuZXcgUmVnRXhwKFwiXlthLXowLTldezh9LVthLXowLTldezR9LVthLXowLTldezR9LVthLXowLTldezR9LVthLXowLTldezEyfSRcIiwgXCJpXCIpO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRU1QVFkgPSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaXNHdWlkKGd1aWQ6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlOiBzdHJpbmcgPSBndWlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgcmV0dXJuIGd1aWQgJiYgKGd1aWQgaW5zdGFuY2VvZiBHdWlkIHx8IEd1aWQudmFsaWRhdG9yLnRlc3QodmFsdWUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpOiBHdWlkIHtcclxuICAgICAgICByZXR1cm4gbmV3IEd1aWQoW0d1aWQuZ2VuKDIpLCBHdWlkLmdlbigxKSwgR3VpZC5nZW4oMSksIEd1aWQuZ2VuKDEpLCBHdWlkLmdlbigzKV0uam9pbihcIi1cIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRW1wdHkoKTogR3VpZCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBHdWlkKFwiZW1wdHlndWlkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoZ3VpZDogc3RyaW5nKTogR3VpZCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBHdWlkKGd1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcmF3KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFtHdWlkLmdlbigyKSwgR3VpZC5nZW4oMSksIEd1aWQuZ2VuKDEpLCBHdWlkLmdlbigxKSwgR3VpZC5nZW4oMyldLmpvaW4oXCItXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdlbihjb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG91dDogc3RyaW5nID0gXCJcIjtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYml0d2lzZVxyXG4gICAgICAgICAgICBvdXQgKz0gKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsdWU6IHN0cmluZztcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGd1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghZ3VpZCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhcmd1bWVudDsgYHZhbHVlYCBoYXMgbm8gdmFsdWUuXCIpOyB9XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBHdWlkLkVNUFRZO1xyXG5cclxuICAgICAgICBpZiAoZ3VpZCAmJiBHdWlkLmlzR3VpZChndWlkKSkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gZ3VpZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogR3VpZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmluZyBzdHJpbmcgYHZhbHVlYCBhZ2FpbnN0IHByb3ZpZGVkIGBndWlkYCB3aWxsIGF1dG8tY2FsbFxyXG4gICAgICAgIC8vIHRvU3RyaW5nIG9uIGBndWlkYCBmb3IgY29tcGFyaXNvblxyXG4gICAgICAgIHJldHVybiBHdWlkLmlzR3VpZChvdGhlcikgJiYgdGhpcy52YWx1ZSA9PT0gb3RoZXIudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gR3VpZC5FTVBUWTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9KU09OKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0VG9rZW4oY29tbWFuZEVudmVsb3BlOiBLZXJuZWxDb21tYW5kRW52ZWxvcGUpIHtcclxuICAgIGlmICghY29tbWFuZEVudmVsb3BlLnRva2VuKSB7XHJcbiAgICAgICAgY29tbWFuZEVudmVsb3BlLnRva2VuID0gR3VpZC5jcmVhdGUoKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUb2tlbkdlbmVyYXRvciB7XHJcbiAgICBwcml2YXRlIF9zZWVkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9jb3VudGVyOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VlZCA9IEd1aWQuY3JlYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLl9jb3VudGVyID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgR2V0TmV3VG9rZW4oKTogc3RyaW5nIHtcclxuICAgICAgICB0aGlzLl9jb3VudGVyKys7XHJcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuX3NlZWR9Ojoke3RoaXMuX2NvdW50ZXJ9YDtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xyXG4gICAgSW5mbyA9IDAsXHJcbiAgICBXYXJuID0gMSxcclxuICAgIEVycm9yID0gMixcclxuICAgIE5vbmUgPSAzLFxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBMb2dFbnRyeSA9IHtcclxuICAgIGxvZ0xldmVsOiBMb2dMZXZlbDtcclxuICAgIHNvdXJjZTogc3RyaW5nO1xyXG4gICAgbWVzc2FnZTogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RlZmF1bHQ6IExvZ2dlciA9IG5ldyBMb2dnZXIoJ2RlZmF1bHQnLCAoX2VudHJ5OiBMb2dFbnRyeSkgPT4geyB9KTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgc291cmNlOiBzdHJpbmcsIHJlYWRvbmx5IHdyaXRlOiAoZW50cnk6IExvZ0VudHJ5KSA9PiB2b2lkKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh7IGxvZ0xldmVsOiBMb2dMZXZlbC5JbmZvLCBzb3VyY2U6IHRoaXMuc291cmNlLCBtZXNzYWdlIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB3YXJuKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMud3JpdGUoeyBsb2dMZXZlbDogTG9nTGV2ZWwuV2Fybiwgc291cmNlOiB0aGlzLnNvdXJjZSwgbWVzc2FnZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh7IGxvZ0xldmVsOiBMb2dMZXZlbC5FcnJvciwgc291cmNlOiB0aGlzLnNvdXJjZSwgbWVzc2FnZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbmZpZ3VyZShzb3VyY2U6IHN0cmluZywgd3JpdGVyOiAoZW50cnk6IExvZ0VudHJ5KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcihzb3VyY2UsIHdyaXRlcik7XHJcbiAgICAgICAgTG9nZ2VyLl9kZWZhdWx0ID0gbG9nZ2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGRlZmF1bHQoKTogTG9nZ2VyIHtcclxuICAgICAgICBpZiAoTG9nZ2VyLl9kZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMb2dnZXIuX2RlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGxvZ2dlciBoYXMgYmVlbiBjb25maWd1cmVkIGZvciB0aGlzIGNvbnRleHQnKTtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XHJcbmltcG9ydCB7IFByb21pc2VDb21wbGV0aW9uU291cmNlIH0gZnJvbSBcIi4vcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2VcIjtcclxuXHJcbmludGVyZmFjZSBTY2hlZHVsZXJPcGVyYXRpb248VD4ge1xyXG4gICAgdmFsdWU6IFQ7XHJcbiAgICBleGVjdXRvcjogKHZhbHVlOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2U6IFByb21pc2VDb21wbGV0aW9uU291cmNlPHZvaWQ+O1xyXG59XHJcbmV4cG9ydCBjbGFzcyBLZXJuZWxTY2hlZHVsZXI8VD4ge1xyXG4gICAgcHJpdmF0ZSBfb3BlcmF0aW9uUXVldWU6IEFycmF5PFNjaGVkdWxlck9wZXJhdGlvbjxUPj4gPSBbXTtcclxuICAgIHByaXZhdGUgX2luRmxpZ2h0T3BlcmF0aW9uPzogU2NoZWR1bGVyT3BlcmF0aW9uPFQ+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5jZWxDdXJyZW50T3BlcmF0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2luRmxpZ2h0T3BlcmF0aW9uPy5wcm9taXNlQ29tcGxldGlvblNvdXJjZS5yZWplY3QobmV3IEVycm9yKFwiT3BlcmF0aW9uIGNhbmNlbGxlZFwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuQXN5bmModmFsdWU6IFQsIGV4ZWN1dG9yOiAodmFsdWU6IFQpID0+IFByb21pc2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSB7XHJcbiAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICBleGVjdXRvcixcclxuICAgICAgICAgICAgcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2U6IG5ldyBQcm9taXNlQ29tcGxldGlvblNvdXJjZTx2b2lkPigpLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9pbkZsaWdodE9wZXJhdGlvbikge1xyXG4gICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWxTY2hlZHVsZXI6IHN0YXJ0aW5nIGltbWVkaWF0ZSBleGVjdXRpb24gb2YgJHtKU09OLnN0cmluZ2lmeShvcGVyYXRpb24udmFsdWUpfWApO1xyXG5cclxuICAgICAgICAgICAgLy8gaW52b2tlIGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb24uZXhlY3V0b3Iob3BlcmF0aW9uLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYGtlcm5lbFNjaGVkdWxlcjogaW1tZWRpYXRlIGV4ZWN1dGlvbiBjb21wbGV0ZWQ6ICR7SlNPTi5zdHJpbmdpZnkob3BlcmF0aW9uLnZhbHVlKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWxTY2hlZHVsZXI6IGltbWVkaWF0ZSBleGVjdXRpb24gZmFpbGVkOiAke0pTT04uc3RyaW5naWZ5KGUpfSAtICR7SlNPTi5zdHJpbmdpZnkob3BlcmF0aW9uLnZhbHVlKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UucmVqZWN0KGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWxTY2hlZHVsZXI6IHNjaGVkdWxpbmcgZXhlY3V0aW9uIG9mICR7SlNPTi5zdHJpbmdpZnkob3BlcmF0aW9uLnZhbHVlKX1gKTtcclxuICAgICAgICB0aGlzLl9vcGVyYXRpb25RdWV1ZS5wdXNoKG9wZXJhdGlvbik7XHJcbiAgICAgICAgaWYgKHRoaXMuX29wZXJhdGlvblF1ZXVlLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4ZWN1dGVOZXh0Q29tbWFuZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbi5wcm9taXNlQ29tcGxldGlvblNvdXJjZS5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXhlY3V0ZU5leHRDb21tYW5kKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5leHRPcGVyYXRpb24gPSB0aGlzLl9vcGVyYXRpb25RdWV1ZS5sZW5ndGggPiAwID8gdGhpcy5fb3BlcmF0aW9uUXVldWVbMF0gOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKG5leHRPcGVyYXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5faW5GbGlnaHRPcGVyYXRpb24gPSBuZXh0T3BlcmF0aW9uO1xyXG4gICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWxTY2hlZHVsZXI6IHN0YXJ0aW5nIHNjaGVkdWxlZCBleGVjdXRpb24gb2YgJHtKU09OLnN0cmluZ2lmeShuZXh0T3BlcmF0aW9uLnZhbHVlKX1gKTtcclxuICAgICAgICAgICAgbmV4dE9wZXJhdGlvbi5leGVjdXRvcihuZXh0T3BlcmF0aW9uLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luRmxpZ2h0T3BlcmF0aW9uID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYGtlcm5lbFNjaGVkdWxlcjogY29tcGxldGluZyBpbmZsaWdodCBvcGVyYXRpb246IHN1Y2Nlc3MgJHtKU09OLnN0cmluZ2lmeShuZXh0T3BlcmF0aW9uLnZhbHVlKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0T3BlcmF0aW9uLnByb21pc2VDb21wbGV0aW9uU291cmNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5GbGlnaHRPcGVyYXRpb24gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhga2VybmVsU2NoZWR1bGVyOiBjb21wbGV0aW5nIGluZmxpZ2h0IG9wZXJhdGlvbjogZmFpbHVyZSAke0pTT04uc3RyaW5naWZ5KGUpfSAtICR7SlNPTi5zdHJpbmdpZnkobmV4dE9wZXJhdGlvbi52YWx1ZSl9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dE9wZXJhdGlvbi5wcm9taXNlQ29tcGxldGlvblNvdXJjZS5yZWplY3QoZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29wZXJhdGlvblF1ZXVlLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGVjdXRlTmV4dENvbW1hbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgS2VybmVsSW52b2NhdGlvbkNvbnRleHQsIGFyZUNvbW1hbmRzVGhlU2FtZSB9IGZyb20gXCIuL2tlcm5lbEludm9jYXRpb25Db250ZXh0XCI7XHJcbmltcG9ydCB7IFRva2VuR2VuZXJhdG9yLCBHdWlkIH0gZnJvbSBcIi4vdG9rZW5HZW5lcmF0b3JcIjtcclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgQ29tcG9zaXRlS2VybmVsIH0gZnJvbSBcIi4vY29tcG9zaXRlS2VybmVsXCI7XHJcbmltcG9ydCB7IEtlcm5lbFNjaGVkdWxlciB9IGZyb20gXCIuL2tlcm5lbFNjaGVkdWxlclwiO1xyXG5pbXBvcnQgeyBQcm9taXNlQ29tcGxldGlvblNvdXJjZSB9IGZyb20gXCIuL3Byb21pc2VDb21wbGV0aW9uU291cmNlXCI7XHJcbmltcG9ydCAqIGFzIGRpc3Bvc2FibGVzIGZyb20gXCIuL2Rpc3Bvc2FibGVzXCI7XHJcbmltcG9ydCB7IHRyeUFkZFVyaVRvUm91dGluZ1NsaXAgfSBmcm9tIFwiLi9jb25uZWN0aW9uXCI7XHJcbmltcG9ydCAqIGFzIHJ4anMgZnJvbSBcInJ4anNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uIHtcclxuICAgIGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZTtcclxuICAgIGNvbnRleHQ6IEtlcm5lbEludm9jYXRpb25Db250ZXh0O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElLZXJuZWxDb21tYW5kSGFuZGxlciB7XHJcbiAgICBjb21tYW5kVHlwZTogc3RyaW5nO1xyXG4gICAgaGFuZGxlOiAoY29tbWFuZEludm9jYXRpb246IElLZXJuZWxDb21tYW5kSW52b2NhdGlvbikgPT4gUHJvbWlzZTx2b2lkPjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJS2VybmVsRXZlbnRPYnNlcnZlciB7XHJcbiAgICAoa2VybmVsRXZlbnQ6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlKTogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGVudW0gS2VybmVsVHlwZSB7XHJcbiAgICBjb21wb3NpdGUsXHJcbiAgICBwcm94eSxcclxuICAgIGRlZmF1bHRcclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBLZXJuZWwge1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsSW5mbzogY29udHJhY3RzLktlcm5lbEluZm87XHJcbiAgICBwcml2YXRlIF9jb21tYW5kSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgSUtlcm5lbENvbW1hbmRIYW5kbGVyPigpO1xyXG4gICAgcHJpdmF0ZSBfZXZlbnRTdWJqZWN0ID0gbmV3IHJ4anMuU3ViamVjdDxjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZT4oKTtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3Rva2VuR2VuZXJhdG9yOiBUb2tlbkdlbmVyYXRvciA9IG5ldyBUb2tlbkdlbmVyYXRvcigpO1xyXG4gICAgcHVibGljIHJvb3RLZXJuZWw6IEtlcm5lbCA9IHRoaXM7XHJcbiAgICBwdWJsaWMgcGFyZW50S2VybmVsOiBDb21wb3NpdGVLZXJuZWwgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgX3NjaGVkdWxlcj86IEtlcm5lbFNjaGVkdWxlcjxjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlPiB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsVHlwZTogS2VybmVsVHlwZSA9IEtlcm5lbFR5cGUuZGVmYXVsdDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGtlcm5lbEluZm8oKTogY29udHJhY3RzLktlcm5lbEluZm8ge1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fa2VybmVsSW5mbztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGtlcm5lbFR5cGUoKTogS2VybmVsVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tlcm5lbFR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNldCBrZXJuZWxUeXBlKHZhbHVlOiBLZXJuZWxUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5fa2VybmVsVHlwZSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQga2VybmVsRXZlbnRzKCk6IHJ4anMuT2JzZXJ2YWJsZTxjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgbmFtZTogc3RyaW5nLCBsYW5ndWFnZU5hbWU/OiBzdHJpbmcsIGxhbmd1YWdlVmVyc2lvbj86IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2tlcm5lbEluZm8gPSB7XHJcbiAgICAgICAgICAgIGxvY2FsTmFtZTogbmFtZSxcclxuICAgICAgICAgICAgbGFuZ3VhZ2VOYW1lOiBsYW5ndWFnZU5hbWUsXHJcbiAgICAgICAgICAgIGFsaWFzZXM6IFtdLFxyXG4gICAgICAgICAgICBsYW5ndWFnZVZlcnNpb246IGxhbmd1YWdlVmVyc2lvbixcclxuICAgICAgICAgICAgc3VwcG9ydGVkRGlyZWN0aXZlczogW10sXHJcbiAgICAgICAgICAgIHN1cHBvcnRlZEtlcm5lbENvbW1hbmRzOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5faW50ZXJuYWxSZWdpc3RlckNvbW1hbmRIYW5kbGVyKHtcclxuICAgICAgICAgICAgY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5SZXF1ZXN0S2VybmVsSW5mb1R5cGUsIGhhbmRsZTogYXN5bmMgaW52b2NhdGlvbiA9PiB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlcXVlc3RLZXJuZWxJbmZvKGludm9jYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFzeW5jIGhhbmRsZVJlcXVlc3RLZXJuZWxJbmZvKGludm9jYXRpb246IElLZXJuZWxDb21tYW5kSW52b2NhdGlvbik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50RW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlID0ge1xyXG4gICAgICAgICAgICBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLFxyXG4gICAgICAgICAgICBjb21tYW5kOiBpbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSxcclxuICAgICAgICAgICAgZXZlbnQ6IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPnsga2VybmVsSW5mbzogdGhpcy5fa2VybmVsSW5mbyB9XHJcbiAgICAgICAgfTsvLz9cclxuXHJcbiAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goZXZlbnRFbnZlbG9wZSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2NoZWR1bGVyKCk6IEtlcm5lbFNjaGVkdWxlcjxjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zY2hlZHVsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gdGhpcy5wYXJlbnRLZXJuZWw/LmdldFNjaGVkdWxlcigpID8/IG5ldyBLZXJuZWxTY2hlZHVsZXI8Y29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZT4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY2hlZHVsZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnN1cmVDb21tYW5kVG9rZW5BbmRJZChjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUpIHtcclxuICAgICAgICBpZiAoIWNvbW1hbmRFbnZlbG9wZS50b2tlbikge1xyXG4gICAgICAgICAgICBsZXQgbmV4dFRva2VuID0gdGhpcy5fdG9rZW5HZW5lcmF0b3IuR2V0TmV3VG9rZW4oKTtcclxuICAgICAgICAgICAgaWYgKEtlcm5lbEludm9jYXRpb25Db250ZXh0LmN1cnJlbnQ/LmNvbW1hbmRFbnZlbG9wZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYSBwYXJlbnQgY29tbWFuZCBleGlzdHMsIGNyZWF0ZSBhIHRva2VuIGhpZXJhcmNoeVxyXG4gICAgICAgICAgICAgICAgbmV4dFRva2VuID0gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuY3VycmVudC5jb21tYW5kRW52ZWxvcGUudG9rZW4hO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbW1hbmRFbnZlbG9wZS50b2tlbiA9IG5leHRUb2tlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY29tbWFuZEVudmVsb3BlLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRFbnZlbG9wZS5pZCA9IEd1aWQuY3JlYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBjdXJyZW50KCk6IEtlcm5lbCB8IG51bGwge1xyXG4gICAgICAgIGlmIChLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jdXJyZW50LmhhbmRsaW5nS2VybmVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IHJvb3QoKTogS2VybmVsIHwgbnVsbCB7XHJcbiAgICAgICAgaWYgKEtlcm5lbC5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBLZXJuZWwuY3VycmVudC5yb290S2VybmVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJcyBpdCB3b3J0aCB1cyBnb2luZyB0byBlZmZvcnRzIHRvIGVuc3VyZSB0aGF0IHRoZSBQcm9taXNlIHJldHVybmVkIGhlcmUgYWNjdXJhdGVseSByZWZsZWN0c1xyXG4gICAgLy8gdGhlIGNvbW1hbmQncyBwcm9ncmVzcz8gVGhlIG9ubHkgdGhpbmcgdGhhdCBhY3R1YWxseSBjYWxscyB0aGlzIGlzIHRoZSBrZXJuZWwgY2hhbm5lbCwgdGhyb3VnaFxyXG4gICAgLy8gdGhlIGNhbGxiYWNrIHNldCB1cCBieSBhdHRhY2hLZXJuZWxUb0NoYW5uZWwsIGFuZCB0aGUgY2FsbGJhY2sgaXMgZXhwZWN0ZWQgdG8gcmV0dXJuIHZvaWQsIHNvXHJcbiAgICAvLyBub3RoaW5nIGlzIGV2ZXIgZ29pbmcgdG8gbG9vayBhdCB0aGUgcHJvbWlzZSB3ZSByZXR1cm4gaGVyZS5cclxuICAgIGFzeW5jIHNlbmQoY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVDb21tYW5kVG9rZW5BbmRJZChjb21tYW5kRW52ZWxvcGUpO1xyXG4gICAgICAgIHRyeUFkZFVyaVRvUm91dGluZ1NsaXAoY29tbWFuZEVudmVsb3BlLCBnZXRLZXJuZWxVcmkodGhpcykpO1xyXG4gICAgICAgIGNvbW1hbmRFbnZlbG9wZS5yb3V0aW5nU2xpcDsvLz9cclxuICAgICAgICBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5lc3RhYmxpc2goY29tbWFuZEVudmVsb3BlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTY2hlZHVsZXIoKS5ydW5Bc3luYyhjb21tYW5kRW52ZWxvcGUsICh2YWx1ZSkgPT4gdGhpcy5leGVjdXRlQ29tbWFuZCh2YWx1ZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IGNvbnRleHQgPSBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5lc3RhYmxpc2goY29tbWFuZEVudmVsb3BlKTtcclxuICAgICAgICBsZXQgcHJldmlvdXNIYW5kbGluZ0tlcm5lbCA9IGNvbnRleHQuaGFuZGxpbmdLZXJuZWw7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlQ29tbWFuZChjb21tYW5kRW52ZWxvcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb250ZXh0LmZhaWwoKDxhbnk+ZSk/Lm1lc3NhZ2UgfHwgSlNPTi5zdHJpbmdpZnkoZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgY29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IHByZXZpb3VzSGFuZGxpbmdLZXJuZWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldENvbW1hbmRIYW5kbGVyKGNvbW1hbmRUeXBlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZFR5cGUpOiBJS2VybmVsQ29tbWFuZEhhbmRsZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb21tYW5kSGFuZGxlcnMuZ2V0KGNvbW1hbmRUeXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDb21tYW5kKGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb250ZXh0ID0gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuZXN0YWJsaXNoKGNvbW1hbmRFbnZlbG9wZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91ZEhlbmRsaW5nS2VybmVsID0gY29udGV4dC5oYW5kbGluZ0tlcm5lbDtcclxuICAgICAgICAgICAgY29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGxldCBpc1Jvb3RDb21tYW5kID0gYXJlQ29tbWFuZHNUaGVTYW1lKGNvbnRleHQuY29tbWFuZEVudmVsb3BlLCBjb21tYW5kRW52ZWxvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50U3Vic2NyaXB0aW9uOiByeGpzLlN1YnNjcmlwdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDsvLz9cclxuXHJcbiAgICAgICAgICAgIGlmIChpc1Jvb3RDb21tYW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWU7Ly8/XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWwgJHt0aGlzLm5hbWV9IG9mIHR5cGUgJHtLZXJuZWxUeXBlW3RoaXMua2VybmVsVHlwZV19IHN1YnNjcmliaW5nIHRvIGNvbnRleHQgZXZlbnRzYCk7XHJcbiAgICAgICAgICAgICAgICBldmVudFN1YnNjcmlwdGlvbiA9IGNvbnRleHQua2VybmVsRXZlbnRzLnBpcGUocnhqcy5tYXAoZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBrZXJuZWwgJHt0aGlzLm5hbWV9IG9mIHR5cGUgJHtLZXJuZWxUeXBlW3RoaXMua2VybmVsVHlwZV19IHNhdyBldmVudCAke2UuZXZlbnRUeXBlfSB3aXRoIHRva2VuICR7ZS5jb21tYW5kPy50b2tlbn1gO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U7Ly8/XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGUsIGdldEtlcm5lbFVyaSh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMucHVibGlzaEV2ZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaGFuZGxlciA9IHRoaXMuZ2V0Q29tbWFuZEhhbmRsZXIoY29tbWFuZEVudmVsb3BlLmNvbW1hbmRUeXBlKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhga2VybmVsICR7dGhpcy5uYW1lfSBhYm91dCB0byBoYW5kbGUgY29tbWFuZDogJHtKU09OLnN0cmluZ2lmeShjb21tYW5kRW52ZWxvcGUpfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGhhbmRsZXIuaGFuZGxlKHsgY29tbWFuZEVudmVsb3BlOiBjb21tYW5kRW52ZWxvcGUsIGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jb21wbGV0ZShjb21tYW5kRW52ZWxvcGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuaGFuZGxpbmdLZXJuZWwgPSBwcmV2aW91ZEhlbmRsaW5nS2VybmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1Jvb3RDb21tYW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50U3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhga2VybmVsICR7dGhpcy5uYW1lfSBkb25lIGhhbmRsaW5nIGNvbW1hbmQ6ICR7SlNPTi5zdHJpbmdpZnkoY29tbWFuZEVudmVsb3BlKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmFpbCgoPGFueT5lKT8ubWVzc2FnZSB8fCBKU09OLnN0cmluZ2lmeShlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IHByZXZpb3VkSGVuZGxpbmdLZXJuZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUm9vdENvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmhhbmRsaW5nS2VybmVsID0gcHJldmlvdWRIZW5kbGluZ0tlcm5lbDtcclxuICAgICAgICAgICAgICAgIGlmIChpc1Jvb3RDb21tYW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBObyBoYW5kbGVyIGZvdW5kIGZvciBjb21tYW5kIHR5cGUgJHtjb21tYW5kRW52ZWxvcGUuY29tbWFuZFR5cGV9YCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3Vic2NyaWJlVG9LZXJuZWxFdmVudHMob2JzZXJ2ZXI6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlT2JzZXJ2ZXIpOiBkaXNwb3NhYmxlcy5EaXNwb3NhYmxlU3Vic2NyaXB0aW9uIHtcclxuICAgICAgICBjb25zdCBzdWIgPSB0aGlzLl9ldmVudFN1YmplY3Quc3Vic2NyaWJlKG9ic2VydmVyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4geyBzdWIudW5zdWJzY3JpYmUoKTsgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNhbkhhbmRsZShjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUpIHtcclxuICAgICAgICBpZiAoY29tbWFuZEVudmVsb3BlLmNvbW1hbmQudGFyZ2V0S2VybmVsTmFtZSAmJiBjb21tYW5kRW52ZWxvcGUuY29tbWFuZC50YXJnZXRLZXJuZWxOYW1lICE9PSB0aGlzLm5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXJuZWxJbmZvLnVyaSAhPT0gY29tbWFuZEVudmVsb3BlLmNvbW1hbmQuZGVzdGluYXRpb25VcmkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3VwcG9ydHNDb21tYW5kKGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kVHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3VwcG9ydHNDb21tYW5kKGNvbW1hbmRUeXBlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZFR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29tbWFuZEhhbmRsZXJzLmhhcyhjb21tYW5kVHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVnaXN0ZXJDb21tYW5kSGFuZGxlcihoYW5kbGVyOiBJS2VybmVsQ29tbWFuZEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBXaGVuIGEgcmVnaXN0cmF0aW9uIGFscmVhZHkgZXhpc3RlZCwgd2Ugd2FudCB0byBvdmVyd3JpdGUgaXQgYmVjYXVzZSB3ZSB3YW50IHVzZXJzIHRvXHJcbiAgICAgICAgLy8gYmUgYWJsZSB0byBkZXZlbG9wIGhhbmRsZXJzIGl0ZXJhdGl2ZWx5LCBhbmQgaXQgd291bGQgYmUgdW5oZWxwZnVsIGZvciBoYW5kbGVyIHJlZ2lzdHJhdGlvblxyXG4gICAgICAgIC8vIGZvciBhbnkgcGFydGljdWxhciBjb21tYW5kIHRvIGJlIGN1bXVsYXRpdmUuXHJcblxyXG4gICAgICAgIGNvbnN0IHNob3VsZE5vdGlmeSA9ICF0aGlzLl9jb21tYW5kSGFuZGxlcnMuaGFzKGhhbmRsZXIuY29tbWFuZFR5cGUpO1xyXG4gICAgICAgIHRoaXMuX2ludGVybmFsUmVnaXN0ZXJDb21tYW5kSGFuZGxlcihoYW5kbGVyKTtcclxuICAgICAgICBpZiAoc2hvdWxkTm90aWZ5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50OiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkID0ge1xyXG4gICAgICAgICAgICAgICAga2VybmVsSW5mbzogdGhpcy5fa2VybmVsSW5mbyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgZW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlID0ge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGVudmVsb3BlLCBnZXRLZXJuZWxVcmkodGhpcykpO1xyXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuY3VycmVudDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5jb21tYW5kID0gY29udGV4dC5jb21tYW5kRW52ZWxvcGU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5wdWJsaXNoKGVudmVsb3BlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaEV2ZW50KGVudmVsb3BlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbnRlcm5hbFJlZ2lzdGVyQ29tbWFuZEhhbmRsZXIoaGFuZGxlcjogSUtlcm5lbENvbW1hbmRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fY29tbWFuZEhhbmRsZXJzLnNldChoYW5kbGVyLmNvbW1hbmRUeXBlLCBoYW5kbGVyKTtcclxuICAgICAgICB0aGlzLl9rZXJuZWxJbmZvLnN1cHBvcnRlZEtlcm5lbENvbW1hbmRzID0gQXJyYXkuZnJvbSh0aGlzLl9jb21tYW5kSGFuZGxlcnMua2V5cygpKS5tYXAoY29tbWFuZE5hbWUgPT4gKHsgbmFtZTogY29tbWFuZE5hbWUgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRIYW5kbGluZ0tlcm5lbChjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUsIGNvbnRleHQ/OiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCB8IG51bGwpOiBLZXJuZWwgfCBudWxsIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5IYW5kbGUoY29tbWFuZEVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb250ZXh0Py5mYWlsKGBDb21tYW5kICR7Y29tbWFuZEVudmVsb3BlLmNvbW1hbmRUeXBlfSBpcyBub3Qgc3VwcG9ydGVkIGJ5IEtlcm5lbCAke3RoaXMubmFtZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBwdWJsaXNoRXZlbnQoa2VybmVsRXZlbnQ6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRTdWJqZWN0Lm5leHQoa2VybmVsRXZlbnQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3VibWl0Q29tbWFuZEFuZEdldFJlc3VsdDxURXZlbnQgZXh0ZW5kcyBjb250cmFjdHMuS2VybmVsRXZlbnQ+KGtlcm5lbDogS2VybmVsLCBjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUsIGV4cGVjdGVkRXZlbnRUeXBlOiBjb250cmFjdHMuS2VybmVsRXZlbnRUeXBlKTogUHJvbWlzZTxURXZlbnQ+IHtcclxuICAgIGxldCBjb21wbGV0aW9uU291cmNlID0gbmV3IFByb21pc2VDb21wbGV0aW9uU291cmNlPFRFdmVudD4oKTtcclxuICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XHJcbiAgICBsZXQgZGlzcG9zYWJsZSA9IGtlcm5lbC5zdWJzY3JpYmVUb0tlcm5lbEV2ZW50cyhldmVudEVudmVsb3BlID0+IHtcclxuICAgICAgICBpZiAoZXZlbnRFbnZlbG9wZS5jb21tYW5kPy50b2tlbiA9PT0gY29tbWFuZEVudmVsb3BlLnRva2VuKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnRFbnZlbG9wZS5ldmVudFR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgY29udHJhY3RzLkNvbW1hbmRGYWlsZWRUeXBlOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaGFuZGxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVyciA9IDxjb250cmFjdHMuQ29tbWFuZEZhaWxlZD5ldmVudEVudmVsb3BlLmV2ZW50Oy8vP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0aW9uU291cmNlLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgY29udHJhY3RzLkNvbW1hbmRTdWNjZWVkZWRUeXBlOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmVDb21tYW5kc1RoZVNhbWUoZXZlbnRFbnZlbG9wZS5jb21tYW5kISwgY29tbWFuZEVudmVsb3BlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoZXZlbnRFbnZlbG9wZS5jb21tYW5kPy5pZCA9PT0gY29tbWFuZEVudmVsb3BlLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZWQpIHsvLz8gKCQgPyBldmVudEVudmVsb3BlIDoge30pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb25Tb3VyY2UucmVqZWN0KCdDb21tYW5kIHdhcyBoYW5kbGVkIGJlZm9yZSByZXBvcnRpbmcgZXhwZWN0ZWQgcmVzdWx0LicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50RW52ZWxvcGUuZXZlbnRUeXBlID09PSBleHBlY3RlZEV2ZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50ID0gPFRFdmVudD5ldmVudEVudmVsb3BlLmV2ZW50Oy8vPyAoJCA/IGV2ZW50RW52ZWxvcGUgOiB7fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvblNvdXJjZS5yZXNvbHZlKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGtlcm5lbC5zZW5kKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29tcGxldGlvblNvdXJjZS5wcm9taXNlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0S2VybmVsVXJpKGtlcm5lbDogS2VybmVsKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBrZXJuZWwua2VybmVsSW5mby51cmkgPz8gYGtlcm5lbDovL2xvY2FsLyR7a2VybmVsLmtlcm5lbEluZm8ubG9jYWxOYW1lfWA7XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgcnhqcyBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgQ29tcG9zaXRlS2VybmVsIH0gZnJvbSAnLi9jb21wb3NpdGVLZXJuZWwnO1xyXG5pbXBvcnQgKiBhcyBjb250cmFjdHMgZnJvbSAnLi9jb250cmFjdHMnO1xyXG5pbXBvcnQgKiBhcyBkaXNwb3NhYmxlcyBmcm9tICcuL2Rpc3Bvc2FibGVzJztcclxuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJy4vZGlzcG9zYWJsZXMnO1xyXG5pbXBvcnQgeyBLZXJuZWxUeXBlIH0gZnJvbSAnLi9rZXJuZWwnO1xyXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XHJcblxyXG5leHBvcnQgdHlwZSBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlID0gY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSB8IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzS2VybmVsQ29tbWFuZEVudmVsb3BlKGNvbW1hbmRPckV2ZW50OiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTogY29tbWFuZE9yRXZlbnQgaXMgY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSB7XHJcbiAgICByZXR1cm4gKDxhbnk+Y29tbWFuZE9yRXZlbnQpLmNvbW1hbmRUeXBlICE9PSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0tlcm5lbEV2ZW50RW52ZWxvcGUoY29tbWFuZE9yRXZlbnQ6IEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpOiBjb21tYW5kT3JFdmVudCBpcyBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSB7XHJcbiAgICByZXR1cm4gKDxhbnk+Y29tbWFuZE9yRXZlbnQpLmV2ZW50VHlwZSAhPT0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciBleHRlbmRzIHJ4anMuU3Vic2NyaWJhYmxlPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+IHtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciB7XHJcbiAgICBzZW5kKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU6IEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpOiBQcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIgaW1wbGVtZW50cyBJS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIge1xyXG4gICAgcHJpdmF0ZSBfb2JzZXJ2YWJsZTogcnhqcy5TdWJzY3JpYmFibGU8S2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT47XHJcbiAgICBwcml2YXRlIF9kaXNwb3NhYmxlczogZGlzcG9zYWJsZXMuRGlzcG9zYWJsZVtdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvYnNlcnZlcjogcnhqcy5PYnNlcnZhYmxlPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KSB7XHJcbiAgICAgICAgdGhpcy5fb2JzZXJ2YWJsZSA9IG9ic2VydmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHN1YnNjcmliZShvYnNlcnZlcjogUGFydGlhbDxyeGpzLk9ic2VydmVyPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+Pik6IHJ4anMuVW5zdWJzY3JpYmFibGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vYnNlcnZhYmxlLnN1YnNjcmliZShvYnNlcnZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgZGlzcG9zYWJsZSBvZiB0aGlzLl9kaXNwb3NhYmxlcykge1xyXG4gICAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGcm9tT2JzZXJ2YWJsZShvYnNlcnZhYmxlOiByeGpzLk9ic2VydmFibGU8S2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT4pOiBJS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIge1xyXG4gICAgICAgIHJldHVybiBuZXcgS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIob2JzZXJ2YWJsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGcm9tRXZlbnRMaXN0ZW5lcihhcmdzOiB7IG1hcDogKGRhdGE6IEV2ZW50KSA9PiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlLCBldmVudFRhcmdldDogRXZlbnRUYXJnZXQsIGV2ZW50OiBzdHJpbmcgfSk6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciB7XHJcbiAgICAgICAgbGV0IHN1YmplY3QgPSBuZXcgcnhqcy5TdWJqZWN0PEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KCk7XHJcbiAgICAgICAgYXJncy5ldmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGFyZ3MuZXZlbnQsIChlOiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbWFwcGVkID0gYXJncy5tYXAoZSk7XHJcbiAgICAgICAgICAgIHN1YmplY3QubmV4dChtYXBwZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBuZXcgS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIoc3ViamVjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JzZXJ2YWJsZShzb3VyY2U6IGFueSk6IHNvdXJjZSBpcyByeGpzLk9ic2VydmVyPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+IHtcclxuICAgIHJldHVybiAoPGFueT5zb3VyY2UpLm5leHQgIT09IHVuZGVmaW5lZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciBpbXBsZW1lbnRzIElLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIge1xyXG4gICAgcHJpdmF0ZSBfc2VuZGVyPzogcnhqcy5PYnNlcnZlcjxLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlPiB8ICgoa2VybmVsRXZlbnRFbnZlbG9wZTogS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSkgPT4gdm9pZCk7XHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG4gICAgc2VuZChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlOiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlbmRlcikge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zZW5kZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbmRlcihrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHRoaXMuX3NlbmRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZW5kZXIubmV4dChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIlNlbmRlciBpcyBub3Qgc2V0XCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiU2VuZGVyIGlzIG5vdCBzZXRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRnJvbU9ic2VydmVyKG9ic2VydmVyOiByeGpzLk9ic2VydmVyPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KTogSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciB7XHJcbiAgICAgICAgY29uc3Qgc2VuZGVyID0gbmV3IEtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlcigpO1xyXG4gICAgICAgIHNlbmRlci5fc2VuZGVyID0gb2JzZXJ2ZXI7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZyb21GdW5jdGlvbihzZW5kOiAoa2VybmVsRXZlbnRFbnZlbG9wZTogS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSkgPT4gdm9pZCk6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIge1xyXG4gICAgICAgIGNvbnN0IHNlbmRlciA9IG5ldyBLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIoKTtcclxuICAgICAgICBzZW5kZXIuX3NlbmRlciA9IHNlbmQ7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRlcjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2V0T2ZTdHJpbmcoY29sbGVjdGlvbjogYW55KTogY29sbGVjdGlvbiBpcyBTZXQ8c3RyaW5nPiB7XHJcbiAgICByZXR1cm4gdHlwZW9mIChjb2xsZWN0aW9uKSAhPT0gdHlwZW9mIChuZXcgU2V0PHN0cmluZz4oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5T2ZTdHJpbmcoY29sbGVjdGlvbjogYW55KTogY29sbGVjdGlvbiBpcyBzdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uKSAmJiBjb2xsZWN0aW9uLmxlbmd0aCA+IDAgJiYgdHlwZW9mIChjb2xsZWN0aW9uWzBdKSA9PT0gdHlwZW9mIChcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyeUFkZFVyaVRvUm91dGluZ1NsaXAoa2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZTogS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSwga2VybmVsVXJpOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmIChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlLnJvdXRpbmdTbGlwID09PSB1bmRlZmluZWQgfHwga2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZS5yb3V0aW5nU2xpcCA9PT0gbnVsbCkge1xyXG4gICAgICAgIGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUucm91dGluZ1NsaXAgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2FuQWRkID0gIWtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUucm91dGluZ1NsaXAuZmluZChlID0+IGUgPT09IGtlcm5lbFVyaSk7XHJcbiAgICBpZiAoY2FuQWRkKSB7XHJcbiAgICAgICAga2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZS5yb3V0aW5nU2xpcC5wdXNoKGtlcm5lbFVyaSk7XHJcbiAgICAgICAga2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZS5yb3V0aW5nU2xpcDsvLz9cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2FuQWRkO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlT3JVcGRhdGVQcm94eUZvcktlcm5lbEluZm8oa2VybmVsSW5mb1Byb2R1Y2VkOiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkLCBjb21wb3NpdGVLZXJuZWw6IENvbXBvc2l0ZUtlcm5lbCkge1xyXG4gICAgY29uc3QgdXJpVG9Mb29rdXAgPSBrZXJuZWxJbmZvUHJvZHVjZWQua2VybmVsSW5mby5yZW1vdGVVcmkgPz8ga2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8udXJpO1xyXG4gICAgaWYgKHVyaVRvTG9va3VwKSB7XHJcbiAgICAgICAgbGV0IGtlcm5lbCA9IGNvbXBvc2l0ZUtlcm5lbC5maW5kS2VybmVsQnlVcmkodXJpVG9Mb29rdXApO1xyXG4gICAgICAgIGlmICgha2VybmVsKSB7XHJcbiAgICAgICAgICAgIC8vIGFkZFxyXG4gICAgICAgICAgICBpZiAoY29tcG9zaXRlS2VybmVsLmhvc3QpIHtcclxuICAgICAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYGNyZWF0aW5nIHByb3h5IGZvciB1cmkgWyR7dXJpVG9Mb29rdXB9XSB3aXRoIGluZm8gJHtKU09OLnN0cmluZ2lmeShrZXJuZWxJbmZvUHJvZHVjZWQpfWApO1xyXG4gICAgICAgICAgICAgICAga2VybmVsID0gY29tcG9zaXRlS2VybmVsLmhvc3QuY29ubmVjdFByb3h5S2VybmVsKGtlcm5lbEluZm9Qcm9kdWNlZC5rZXJuZWxJbmZvLmxvY2FsTmFtZSwgdXJpVG9Mb29rdXAsIGtlcm5lbEluZm9Qcm9kdWNlZC5rZXJuZWxJbmZvLmFsaWFzZXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyBrZXJuZWwgaG9zdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcGF0Y2hpbmcgcHJveHkgZm9yIHVyaSBbJHt1cmlUb0xvb2t1cH1dIHdpdGggaW5mbyAke0pTT04uc3RyaW5naWZ5KGtlcm5lbEluZm9Qcm9kdWNlZCl9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoa2VybmVsLmtlcm5lbFR5cGUgPT09IEtlcm5lbFR5cGUucHJveHkpIHtcclxuICAgICAgICAgICAgLy8gcGF0Y2hcclxuICAgICAgICAgICAgdXBkYXRlS2VybmVsSW5mbyhrZXJuZWwua2VybmVsSW5mbywga2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzS2VybmVsSW5mb0ZvclByb3h5KGtlcm5lbEluZm86IGNvbnRyYWN0cy5LZXJuZWxJbmZvKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBoYXNVcmkgPSAhIWtlcm5lbEluZm8udXJpO1xyXG4gICAgY29uc3QgaGFzUmVtb3RlVXJpID0gISFrZXJuZWxJbmZvLnJlbW90ZVVyaTtcclxuICAgIHJldHVybiBoYXNVcmkgJiYgaGFzUmVtb3RlVXJpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlS2VybmVsSW5mbyhkZXN0aW5hdGlvbjogY29udHJhY3RzLktlcm5lbEluZm8sIGluY29taW5nOiBjb250cmFjdHMuS2VybmVsSW5mbykge1xyXG4gICAgZGVzdGluYXRpb24ubGFuZ3VhZ2VOYW1lID0gaW5jb21pbmcubGFuZ3VhZ2VOYW1lID8/IGRlc3RpbmF0aW9uLmxhbmd1YWdlTmFtZTtcclxuICAgIGRlc3RpbmF0aW9uLmxhbmd1YWdlVmVyc2lvbiA9IGluY29taW5nLmxhbmd1YWdlVmVyc2lvbiA/PyBkZXN0aW5hdGlvbi5sYW5ndWFnZVZlcnNpb247XHJcblxyXG4gICAgY29uc3Qgc3VwcG9ydGVkRGlyZWN0aXZlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgY29uc3Qgc3VwcG9ydGVkQ29tbWFuZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuXHJcbiAgICBpZiAoIWRlc3RpbmF0aW9uLnN1cHBvcnRlZERpcmVjdGl2ZXMpIHtcclxuICAgICAgICBkZXN0aW5hdGlvbi5zdXBwb3J0ZWREaXJlY3RpdmVzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkZXN0aW5hdGlvbi5zdXBwb3J0ZWRLZXJuZWxDb21tYW5kcykge1xyXG4gICAgICAgIGRlc3RpbmF0aW9uLnN1cHBvcnRlZEtlcm5lbENvbW1hbmRzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBzdXBwb3J0ZWREaXJlY3RpdmUgb2YgZGVzdGluYXRpb24uc3VwcG9ydGVkRGlyZWN0aXZlcykge1xyXG4gICAgICAgIHN1cHBvcnRlZERpcmVjdGl2ZXMuYWRkKHN1cHBvcnRlZERpcmVjdGl2ZS5uYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IHN1cHBvcnRlZENvbW1hbmQgb2YgZGVzdGluYXRpb24uc3VwcG9ydGVkS2VybmVsQ29tbWFuZHMpIHtcclxuICAgICAgICBzdXBwb3J0ZWRDb21tYW5kcy5hZGQoc3VwcG9ydGVkQ29tbWFuZC5uYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IHN1cHBvcnRlZERpcmVjdGl2ZSBvZiBpbmNvbWluZy5zdXBwb3J0ZWREaXJlY3RpdmVzKSB7XHJcbiAgICAgICAgaWYgKCFzdXBwb3J0ZWREaXJlY3RpdmVzLmhhcyhzdXBwb3J0ZWREaXJlY3RpdmUubmFtZSkpIHtcclxuICAgICAgICAgICAgc3VwcG9ydGVkRGlyZWN0aXZlcy5hZGQoc3VwcG9ydGVkRGlyZWN0aXZlLm5hbWUpO1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbi5zdXBwb3J0ZWREaXJlY3RpdmVzLnB1c2goc3VwcG9ydGVkRGlyZWN0aXZlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBzdXBwb3J0ZWRDb21tYW5kIG9mIGluY29taW5nLnN1cHBvcnRlZEtlcm5lbENvbW1hbmRzKSB7XHJcbiAgICAgICAgaWYgKCFzdXBwb3J0ZWRDb21tYW5kcy5oYXMoc3VwcG9ydGVkQ29tbWFuZC5uYW1lKSkge1xyXG4gICAgICAgICAgICBzdXBwb3J0ZWRDb21tYW5kcy5hZGQoc3VwcG9ydGVkQ29tbWFuZC5uYW1lKTtcclxuICAgICAgICAgICAgZGVzdGluYXRpb24uc3VwcG9ydGVkS2VybmVsQ29tbWFuZHMucHVzaChzdXBwb3J0ZWRDb21tYW5kKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDb25uZWN0b3IgaW1wbGVtZW50cyBEaXNwb3NhYmxlIHtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2xpc3RlbmVyOiByeGpzLlVuc3Vic2NyaWJhYmxlO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVjZWl2ZXI6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlcjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3NlbmRlcjogSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlcjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3JlbW90ZVVyaXM6IFNldDxzdHJpbmc+ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcblxyXG4gICAgcHVibGljIGdldCByZW1vdGVIb3N0VXJpcygpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fcmVtb3RlVXJpcy52YWx1ZXMoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzZW5kZXIoKTogSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJlY2VpdmVyKCk6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlY2VpdmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZ3VyYXRpb246IHsgcmVjZWl2ZXI6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciwgc2VuZGVyOiBJS2VybmVsQ29tbWFuZEFuZEV2ZW50U2VuZGVyLCByZW1vdGVVcmlzPzogc3RyaW5nW10gfSkge1xyXG4gICAgICAgIHRoaXMuX3JlY2VpdmVyID0gY29uZmlndXJhdGlvbi5yZWNlaXZlcjtcclxuICAgICAgICB0aGlzLl9zZW5kZXIgPSBjb25maWd1cmF0aW9uLnNlbmRlcjtcclxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW1vdGVVcmlzKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVtb3RlVXJpIG9mIGNvbmZpZ3VyYXRpb24ucmVtb3RlVXJpcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJpID0gZXh0cmFjdEhvc3RBbmROb21hbGl6ZShyZW1vdGVVcmkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVyaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlbW90ZVVyaXMuYWRkKHVyaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9saXN0ZW5lciA9IHRoaXMuX3JlY2VpdmVyLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICAgIG5leHQ6IChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlOiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNLZXJuZWxFdmVudEVudmVsb3BlKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUuZXZlbnRUeXBlID09PSBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPmtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUuZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXZlbnQua2VybmVsSW5mby5yZW1vdGVVcmkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IGV4dHJhY3RIb3N0QW5kTm9tYWxpemUoZXZlbnQua2VybmVsSW5mby51cmkhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdGVVcmlzLmFkZCh1cmkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoa2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZS5yb3V0aW5nU2xpcD8ubGVuZ3RoID8/IDApID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudE9yaWdpbiA9IGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUucm91dGluZ1NsaXAhWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBleHRyYWN0SG9zdEFuZE5vbWFsaXplKGV2ZW50T3JpZ2luKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVyaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVtb3RlVXJpcy5hZGQodXJpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5SZWFjaChyZW1vdGVVcmk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGhvc3QgPSBleHRyYWN0SG9zdEFuZE5vbWFsaXplKHJlbW90ZVVyaSk7Ly8/XHJcbiAgICAgICAgaWYgKGhvc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZVVyaXMuaGFzKGhvc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0SG9zdEFuZE5vbWFsaXplKGtlcm5lbFVyaTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIGNvbnN0IGZpbHRlcjogUmVnRXhwID0gLyg/PGhvc3Q+Lis6XFwvXFwvW15cXC9dKykoXFwvW15cXC9dKSovZ2k7XHJcbiAgICBjb25zdCBtYXRjaCA9IGZpbHRlci5leGVjKGtlcm5lbFVyaSk7IC8vP1xyXG4gICAgaWYgKG1hdGNoPy5ncm91cHM/Lmhvc3QpIHtcclxuICAgICAgICBjb25zdCBob3N0ID0gbWF0Y2guZ3JvdXBzLmhvc3Q7XHJcbiAgICAgICAgcmV0dXJuIGhvc3Q7Ly8/XHJcbiAgICB9XHJcbiAgICByZXR1cm4gXCJcIjtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgdHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcCB9IGZyb20gXCIuL2Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBnZXRLZXJuZWxVcmksIElLZXJuZWxDb21tYW5kSW52b2NhdGlvbiwgS2VybmVsLCBLZXJuZWxUeXBlIH0gZnJvbSBcIi4va2VybmVsXCI7XHJcbmltcG9ydCB7IEtlcm5lbEhvc3QgfSBmcm9tIFwiLi9rZXJuZWxIb3N0XCI7XHJcbmltcG9ydCB7IEtlcm5lbEludm9jYXRpb25Db250ZXh0IH0gZnJvbSBcIi4va2VybmVsSW52b2NhdGlvbkNvbnRleHRcIjtcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlS2VybmVsIGV4dGVuZHMgS2VybmVsIHtcclxuICAgIHByaXZhdGUgX2hvc3Q6IEtlcm5lbEhvc3QgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2RlZmF1bHRLZXJuZWxOYW1lc0J5Q29tbWFuZFR5cGU6IE1hcDxjb250cmFjdHMuS2VybmVsQ29tbWFuZFR5cGUsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgZGVmYXVsdEtlcm5lbE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX2NoaWxkS2VybmVsczogS2VybmVsQ29sbGVjdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmtlcm5lbFR5cGUgPSBLZXJuZWxUeXBlLmNvbXBvc2l0ZTtcclxuICAgICAgICB0aGlzLl9jaGlsZEtlcm5lbHMgPSBuZXcgS2VybmVsQ29sbGVjdGlvbih0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY2hpbGRLZXJuZWxzKCkge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX2NoaWxkS2VybmVscyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGhvc3QoKTogS2VybmVsSG9zdCB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ob3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBob3N0KGhvc3Q6IEtlcm5lbEhvc3QgfCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5faG9zdCA9IGhvc3Q7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXJuZWxJbmZvLnVyaSA9IHRoaXMuX2hvc3QudXJpO1xyXG4gICAgICAgICAgICB0aGlzLl9jaGlsZEtlcm5lbHMubm90aWZ5VGhhdEhvc3RXYXNTZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIGFzeW5jIGhhbmRsZVJlcXVlc3RLZXJuZWxJbmZvKGludm9jYXRpb246IElLZXJuZWxDb21tYW5kSW52b2NhdGlvbik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGZvciAobGV0IGtlcm5lbCBvZiB0aGlzLl9jaGlsZEtlcm5lbHMpIHtcclxuICAgICAgICAgICAgaWYgKGtlcm5lbC5zdXBwb3J0c0NvbW1hbmQoaW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUuY29tbWFuZFR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBrZXJuZWwuaGFuZGxlQ29tbWFuZCh7IGNvbW1hbmQ6IHt9LCBjb21tYW5kVHlwZTogY29udHJhY3RzLlJlcXVlc3RLZXJuZWxJbmZvVHlwZSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGQoa2VybmVsOiBLZXJuZWwsIGFsaWFzZXM/OiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGlmICgha2VybmVsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImtlcm5lbCBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZGVmYXVsdEtlcm5lbE5hbWUpIHtcclxuICAgICAgICAgICAgLy8gZGVmYXVsdCB0byBmaXJzdCBrZXJuZWxcclxuICAgICAgICAgICAgdGhpcy5kZWZhdWx0S2VybmVsTmFtZSA9IGtlcm5lbC5uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAga2VybmVsLnBhcmVudEtlcm5lbCA9IHRoaXM7XHJcbiAgICAgICAga2VybmVsLnJvb3RLZXJuZWwgPSB0aGlzLnJvb3RLZXJuZWw7XHJcbiAgICAgICAga2VybmVsLmtlcm5lbEV2ZW50cy5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgICBuZXh0OiAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50Oy8vP1xyXG4gICAgICAgICAgICAgICAgdHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcChldmVudCwgZ2V0S2VybmVsVXJpKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50Oy8vP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWJsaXNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChhbGlhc2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBzZXQgPSBuZXcgU2V0KGFsaWFzZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGtlcm5lbC5rZXJuZWxJbmZvLmFsaWFzZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGFsaWFzIGluIGtlcm5lbC5rZXJuZWxJbmZvLmFsaWFzZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXQuYWRkKGFsaWFzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAga2VybmVsLmtlcm5lbEluZm8uYWxpYXNlcyA9IEFycmF5LmZyb20oc2V0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2NoaWxkS2VybmVscy5hZGQoa2VybmVsLCBhbGlhc2VzKTtcclxuXHJcbiAgICAgICAgY29uc3QgaW52b2NhdGlvbkNvbnRleHQgPSBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jdXJyZW50O1xyXG5cclxuICAgICAgICBpZiAoaW52b2NhdGlvbkNvbnRleHQpIHtcclxuICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQuY29tbWFuZEVudmVsb3BlOy8vP1xyXG4gICAgICAgICAgICBpbnZvY2F0aW9uQ29udGV4dC5wdWJsaXNoKHtcclxuICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUsXHJcbiAgICAgICAgICAgICAgICBldmVudDogPGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWQ+e1xyXG4gICAgICAgICAgICAgICAgICAgIGtlcm5lbEluZm86IGtlcm5lbC5rZXJuZWxJbmZvXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29tbWFuZDogaW52b2NhdGlvbkNvbnRleHQuY29tbWFuZEVudmVsb3BlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucHVibGlzaEV2ZW50KHtcclxuICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUsXHJcbiAgICAgICAgICAgICAgICBldmVudDogPGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWQ+e1xyXG4gICAgICAgICAgICAgICAgICAgIGtlcm5lbEluZm86IGtlcm5lbC5rZXJuZWxJbmZvXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmaW5kS2VybmVsQnlVcmkodXJpOiBzdHJpbmcpOiBLZXJuZWwgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZEtlcm5lbHMudHJ5R2V0QnlVcmkodXJpKTtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kS2VybmVsQnlOYW1lKG5hbWU6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkS2VybmVscy50cnlHZXRCeUFsaWFzKG5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERlZmF1bHRUYXJnZXRLZXJuZWxOYW1lRm9yQ29tbWFuZChjb21tYW5kVHlwZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRUeXBlLCBrZXJuZWxOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9kZWZhdWx0S2VybmVsTmFtZXNCeUNvbW1hbmRUeXBlLnNldChjb21tYW5kVHlwZSwga2VybmVsTmFtZSk7XHJcbiAgICB9XHJcbiAgICBvdmVycmlkZSBoYW5kbGVDb21tYW5kKGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IGludm9jYXRpb25Db250ZXh0ID0gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuY3VycmVudDtcclxuXHJcbiAgICAgICAgbGV0IGtlcm5lbCA9IGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLnRhcmdldEtlcm5lbE5hbWUgPT09IHRoaXMubmFtZVxyXG4gICAgICAgICAgICA/IHRoaXNcclxuICAgICAgICAgICAgOiB0aGlzLmdldEhhbmRsaW5nS2VybmVsKGNvbW1hbmRFbnZlbG9wZSwgaW52b2NhdGlvbkNvbnRleHQpO1xyXG5cclxuXHJcbiAgICAgICAgY29uc3QgcHJldml1c29IYW5kbGluZ0tlcm5lbCA9IGludm9jYXRpb25Db250ZXh0Py5oYW5kbGluZ0tlcm5lbCA/PyBudWxsO1xyXG5cclxuICAgICAgICBpZiAoa2VybmVsID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnZvY2F0aW9uQ29udGV4dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQuaGFuZGxpbmdLZXJuZWwgPSBrZXJuZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmhhbmRsZUNvbW1hbmQoY29tbWFuZEVudmVsb3BlKS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnZvY2F0aW9uQ29udGV4dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGludm9jYXRpb25Db250ZXh0LmhhbmRsaW5nS2VybmVsID0gcHJldml1c29IYW5kbGluZ0tlcm5lbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXJuZWwpIHtcclxuICAgICAgICAgICAgaWYgKGludm9jYXRpb25Db250ZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpbnZvY2F0aW9uQ29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IGtlcm5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGNvbW1hbmRFbnZlbG9wZSwgZ2V0S2VybmVsVXJpKGtlcm5lbCkpO1xyXG4gICAgICAgICAgICByZXR1cm4ga2VybmVsLmhhbmRsZUNvbW1hbmQoY29tbWFuZEVudmVsb3BlKS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnZvY2F0aW9uQ29udGV4dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGludm9jYXRpb25Db250ZXh0LmhhbmRsaW5nS2VybmVsID0gcHJldml1c29IYW5kbGluZ0tlcm5lbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW52b2NhdGlvbkNvbnRleHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQuaGFuZGxpbmdLZXJuZWwgPSBwcmV2aXVzb0hhbmRsaW5nS2VybmVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiS2VybmVsIG5vdCBmb3VuZDogXCIgKyBjb21tYW5kRW52ZWxvcGUuY29tbWFuZC50YXJnZXRLZXJuZWxOYW1lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3ZlcnJpZGUgZ2V0SGFuZGxpbmdLZXJuZWwoY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlLCBjb250ZXh0PzogS2VybmVsSW52b2NhdGlvbkNvbnRleHQgfCBudWxsKTogS2VybmVsIHwgbnVsbCB7XHJcblxyXG4gICAgICAgIGxldCBrZXJuZWw6IEtlcm5lbCB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmIChjb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaSkge1xyXG4gICAgICAgICAgICBrZXJuZWwgPSB0aGlzLl9jaGlsZEtlcm5lbHMudHJ5R2V0QnlVcmkoY29tbWFuZEVudmVsb3BlLmNvbW1hbmQuZGVzdGluYXRpb25VcmkpID8/IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChrZXJuZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBrZXJuZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXRLZXJuZWxOYW1lID0gY29tbWFuZEVudmVsb3BlLmNvbW1hbmQudGFyZ2V0S2VybmVsTmFtZTtcclxuXHJcbiAgICAgICAgaWYgKHRhcmdldEtlcm5lbE5hbWUgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRLZXJuZWxOYW1lID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbkhhbmRsZShjb21tYW5kRW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0S2VybmVsTmFtZSA9IHRoaXMuX2RlZmF1bHRLZXJuZWxOYW1lc0J5Q29tbWFuZFR5cGUuZ2V0KGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kVHlwZSkgPz8gdGhpcy5kZWZhdWx0S2VybmVsTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXRLZXJuZWxOYW1lICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0S2VybmVsTmFtZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBrZXJuZWwgPSB0aGlzLl9jaGlsZEtlcm5lbHMudHJ5R2V0QnlBbGlhcyh0YXJnZXRLZXJuZWxOYW1lKSA/PyBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRhcmdldEtlcm5lbE5hbWUgJiYgIWtlcm5lbCkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgS2VybmVsIG5vdCBmb3VuZDogJHt0YXJnZXRLZXJuZWxOYW1lfWA7XHJcbiAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmVycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFrZXJuZWwpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGlsZEtlcm5lbHMuY291bnQgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGtlcm5lbCA9IHRoaXMuX2NoaWxkS2VybmVscy5zaW5nbGUoKSA/PyBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWtlcm5lbCkge1xyXG4gICAgICAgICAgICBrZXJuZWwgPSBjb250ZXh0Py5oYW5kbGluZ0tlcm5lbCA/PyBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2VybmVsID8/IHRoaXM7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBLZXJuZWxDb2xsZWN0aW9uIGltcGxlbWVudHMgSXRlcmFibGU8S2VybmVsPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfY29tcG9zaXRlS2VybmVsOiBDb21wb3NpdGVLZXJuZWw7XHJcbiAgICBwcml2YXRlIF9rZXJuZWxzOiBLZXJuZWxbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfbmFtZUFuZEFsaWFzZXNCeUtlcm5lbDogTWFwPEtlcm5lbCwgU2V0PHN0cmluZz4+ID0gbmV3IE1hcDxLZXJuZWwsIFNldDxzdHJpbmc+PigpO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsc0J5TmFtZU9yQWxpYXM6IE1hcDxzdHJpbmcsIEtlcm5lbD4gPSBuZXcgTWFwPHN0cmluZywgS2VybmVsPigpO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsc0J5TG9jYWxVcmk6IE1hcDxzdHJpbmcsIEtlcm5lbD4gPSBuZXcgTWFwPHN0cmluZywgS2VybmVsPigpO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsc0J5UmVtb3RlVXJpOiBNYXA8c3RyaW5nLCBLZXJuZWw+ID0gbmV3IE1hcDxzdHJpbmcsIEtlcm5lbD4oKTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb21wb3NpdGVLZXJuZWw6IENvbXBvc2l0ZUtlcm5lbCkge1xyXG4gICAgICAgIHRoaXMuX2NvbXBvc2l0ZUtlcm5lbCA9IGNvbXBvc2l0ZUtlcm5lbDtcclxuICAgIH1cclxuXHJcbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxLZXJuZWw+IHtcclxuICAgICAgICBsZXQgY291bnRlciA9IDA7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5fa2VybmVsc1tjb3VudGVyKytdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGNvdW50ZXIgPiB0aGlzLl9rZXJuZWxzLmxlbmd0aCAvLz9cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHNpbmdsZSgpOiBLZXJuZWwgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxzLmxlbmd0aCA9PT0gMSA/IHRoaXMuX2tlcm5lbHNbMF0gOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBhZGQoa2VybmVsOiBLZXJuZWwsIGFsaWFzZXM/OiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9rZXJuZWxzQnlOYW1lT3JBbGlhcy5oYXMoa2VybmVsLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihga2VybmVsIHdpdGggbmFtZSAke2tlcm5lbC5uYW1lfSBhbHJlYWR5IGV4aXN0c2ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUtlcm5lbEluZm9BbmRJbmRleChrZXJuZWwsIGFsaWFzZXMpO1xyXG4gICAgICAgIHRoaXMuX2tlcm5lbHMucHVzaChrZXJuZWwpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXQgY291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2VybmVscy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlS2VybmVsSW5mb0FuZEluZGV4KGtlcm5lbDogS2VybmVsLCBhbGlhc2VzPzogc3RyaW5nW10pOiB2b2lkIHtcclxuXHJcbiAgICAgICAgaWYgKGFsaWFzZXMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgYWxpYXMgb2YgYWxpYXNlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2tlcm5lbHNCeU5hbWVPckFsaWFzLmhhcyhhbGlhcykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGtlcm5lbCB3aXRoIGFsaWFzICR7YWxpYXN9IGFscmVhZHkgZXhpc3RzYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fbmFtZUFuZEFsaWFzZXNCeUtlcm5lbC5oYXMoa2VybmVsKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgYWxpYXMgb2Yga2VybmVsLmtlcm5lbEluZm8uYWxpYXNlcykge1xyXG4gICAgICAgICAgICAgICAgc2V0LmFkZChhbGlhcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGtlcm5lbC5rZXJuZWxJbmZvLmFsaWFzZXMgPSBBcnJheS5mcm9tKHNldCk7XHJcblxyXG4gICAgICAgICAgICBzZXQuYWRkKGtlcm5lbC5rZXJuZWxJbmZvLmxvY2FsTmFtZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9uYW1lQW5kQWxpYXNlc0J5S2VybmVsLnNldChrZXJuZWwsIHNldCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhbGlhc2VzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGFsaWFzIG9mIGFsaWFzZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25hbWVBbmRBbGlhc2VzQnlLZXJuZWwuZ2V0KGtlcm5lbCkhLmFkZChhbGlhcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX25hbWVBbmRBbGlhc2VzQnlLZXJuZWwuZ2V0KGtlcm5lbCk/LmZvckVhY2goYWxpYXMgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXJuZWxzQnlOYW1lT3JBbGlhcy5zZXQoYWxpYXMsIGtlcm5lbCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb21wb3NpdGVLZXJuZWwuaG9zdCkge1xyXG4gICAgICAgICAgICBrZXJuZWwua2VybmVsSW5mby51cmkgPSBgJHt0aGlzLl9jb21wb3NpdGVLZXJuZWwuaG9zdC51cml9LyR7a2VybmVsLm5hbWV9YDsvLz9cclxuICAgICAgICAgICAgdGhpcy5fa2VybmVsc0J5TG9jYWxVcmkuc2V0KGtlcm5lbC5rZXJuZWxJbmZvLnVyaSwga2VybmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChrZXJuZWwua2VybmVsVHlwZSA9PT0gS2VybmVsVHlwZS5wcm94eSkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXJuZWxzQnlSZW1vdGVVcmkuc2V0KGtlcm5lbC5rZXJuZWxJbmZvLnJlbW90ZVVyaSEsIGtlcm5lbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRCeUFsaWFzKGFsaWFzOiBzdHJpbmcpOiBLZXJuZWwgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxzQnlOYW1lT3JBbGlhcy5nZXQoYWxpYXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRCeVVyaSh1cmk6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IGtlcm5lbCA9IHRoaXMuX2tlcm5lbHNCeUxvY2FsVXJpLmdldCh1cmkpIHx8IHRoaXMuX2tlcm5lbHNCeVJlbW90ZVVyaS5nZXQodXJpKTtcclxuICAgICAgICByZXR1cm4ga2VybmVsO1xyXG4gICAgfVxyXG4gICAgbm90aWZ5VGhhdEhvc3RXYXNTZXQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2VybmVsIG9mIHRoaXMuX2tlcm5lbHMpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVLZXJuZWxJbmZvQW5kSW5kZXgoa2VybmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gQ29weXJpZ2h0IChjKSAuTkVUIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGZ1bGwgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcInV0aWxcIjtcclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCB9IGZyb20gXCIuL2tlcm5lbEludm9jYXRpb25Db250ZXh0XCI7XHJcbmltcG9ydCAqIGFzIGRpc3Bvc2FibGVzIGZyb20gXCIuL2Rpc3Bvc2FibGVzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29uc29sZUNhcHR1cmUgaW1wbGVtZW50cyBkaXNwb3NhYmxlcy5EaXNwb3NhYmxlIHtcclxuICAgIHByaXZhdGUgb3JpZ2luYWxDb25zb2xlOiBDb25zb2xlO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsSW52b2NhdGlvbkNvbnRleHQ6IEtlcm5lbEludm9jYXRpb25Db250ZXh0IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlID0gY29uc29sZTtcclxuICAgICAgICBjb25zb2xlID0gPENvbnNvbGU+PGFueT50aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBrZXJuZWxJbnZvY2F0aW9uQ29udGV4dCh2YWx1ZTogS2VybmVsSW52b2NhdGlvbkNvbnRleHQgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9rZXJuZWxJbnZvY2F0aW9uQ29udGV4dCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCh2YWx1ZTogYW55LCBtZXNzYWdlPzogc3RyaW5nLCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5hc3NlcnQodmFsdWUsIG1lc3NhZ2UsIG9wdGlvbmFsUGFyYW1zKTtcclxuICAgIH1cclxuICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgICBjb3VudChsYWJlbD86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmNvdW50KGxhYmVsKTtcclxuICAgIH1cclxuICAgIGNvdW50UmVzZXQobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5jb3VudFJlc2V0KGxhYmVsKTtcclxuICAgIH1cclxuICAgIGRlYnVnKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmRlYnVnKG1lc3NhZ2UsIG9wdGlvbmFsUGFyYW1zKTtcclxuICAgIH1cclxuICAgIGRpcihvYmo6IGFueSwgb3B0aW9ucz86IHV0aWwuSW5zcGVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5kaXIob2JqLCBvcHRpb25zKTtcclxuICAgIH1cclxuICAgIGRpcnhtbCguLi5kYXRhOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmRpcnhtbChkYXRhKTtcclxuICAgIH1cclxuICAgIGVycm9yKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVkaXJlY3RBbmRQdWJsaXNoKHRoaXMub3JpZ2luYWxDb25zb2xlLmVycm9yLCAuLi5bbWVzc2FnZSwgLi4ub3B0aW9uYWxQYXJhbXNdKTtcclxuICAgIH1cclxuXHJcbiAgICBncm91cCguLi5sYWJlbDogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5ncm91cChsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBncm91cENvbGxhcHNlZCguLi5sYWJlbDogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5ncm91cENvbGxhcHNlZChsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBncm91cEVuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfVxyXG4gICAgaW5mbyhtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZGlyZWN0QW5kUHVibGlzaCh0aGlzLm9yaWdpbmFsQ29uc29sZS5pbmZvLCAuLi5bbWVzc2FnZSwgLi4ub3B0aW9uYWxQYXJhbXNdKTtcclxuICAgIH1cclxuICAgIGxvZyhtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZGlyZWN0QW5kUHVibGlzaCh0aGlzLm9yaWdpbmFsQ29uc29sZS5sb2csIC4uLlttZXNzYWdlLCAuLi5vcHRpb25hbFBhcmFtc10pO1xyXG4gICAgfVxyXG5cclxuICAgIHRhYmxlKHRhYnVsYXJEYXRhOiBhbnksIHByb3BlcnRpZXM/OiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLnRhYmxlKHRhYnVsYXJEYXRhLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuICAgIHRpbWUobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS50aW1lKGxhYmVsKTtcclxuICAgIH1cclxuICAgIHRpbWVFbmQobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS50aW1lRW5kKGxhYmVsKTtcclxuICAgIH1cclxuICAgIHRpbWVMb2cobGFiZWw/OiBzdHJpbmcsIC4uLmRhdGE6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbENvbnNvbGUudGltZUxvZyhsYWJlbCwgZGF0YSk7XHJcbiAgICB9XHJcbiAgICB0aW1lU3RhbXAobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS50aW1lU3RhbXAobGFiZWwpO1xyXG4gICAgfVxyXG4gICAgdHJhY2UobWVzc2FnZT86IGFueSwgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWRpcmVjdEFuZFB1Ymxpc2godGhpcy5vcmlnaW5hbENvbnNvbGUudHJhY2UsIC4uLlttZXNzYWdlLCAuLi5vcHRpb25hbFBhcmFtc10pO1xyXG4gICAgfVxyXG4gICAgd2FybihtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS53YXJuKG1lc3NhZ2UsIG9wdGlvbmFsUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm9maWxlKGxhYmVsPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbENvbnNvbGUucHJvZmlsZShsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBwcm9maWxlRW5kKGxhYmVsPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbENvbnNvbGUucHJvZmlsZUVuZChsYWJlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlID0gdGhpcy5vcmlnaW5hbENvbnNvbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWRpcmVjdEFuZFB1Ymxpc2godGFyZ2V0OiAoLi4uYXJnczogYW55W10pID0+IHZvaWQsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2tlcm5lbEludm9jYXRpb25Db250ZXh0KSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtaW1lVHlwZTogc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoYXJnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlID0gJ3RleHQvcGxhaW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYXJnPy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJztcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEpTT04uc3RyaW5naWZ5KGFyZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheWVkVmFsdWU6IGNvbnRyYWN0cy5EaXNwbGF5ZWRWYWx1ZVByb2R1Y2VkID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50RW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLkRpc3BsYXllZFZhbHVlUHJvZHVjZWRUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBkaXNwbGF5ZWRWYWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiB0aGlzLl9rZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jb21tYW5kRW52ZWxvcGVcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2VybmVsSW52b2NhdGlvbkNvbnRleHQucHVibGlzaChldmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHRhcmdldCguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBDb25zb2xlQ2FwdHVyZSB9IGZyb20gXCIuL2NvbnNvbGVDYXB0dXJlXCI7XHJcbmltcG9ydCB7IEtlcm5lbCwgSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uIH0gZnJvbSBcIi4va2VybmVsXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEphdmFzY3JpcHRLZXJuZWwgZXh0ZW5kcyBLZXJuZWwge1xyXG4gICAgcHJpdmF0ZSBzdXBwcmVzc2VkTG9jYWxzOiBTZXQ8c3RyaW5nPjtcclxuICAgIHByaXZhdGUgY2FwdHVyZTogQ29uc29sZUNhcHR1cmU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUgPz8gXCJqYXZhc2NyaXB0XCIsIFwiSmF2YXNjcmlwdFwiKTtcclxuICAgICAgICB0aGlzLnN1cHByZXNzZWRMb2NhbHMgPSBuZXcgU2V0PHN0cmluZz4odGhpcy5hbGxMb2NhbFZhcmlhYmxlTmFtZXMoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckNvbW1hbmRIYW5kbGVyKHsgY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5TdWJtaXRDb2RlVHlwZSwgaGFuZGxlOiBpbnZvY2F0aW9uID0+IHRoaXMuaGFuZGxlU3VibWl0Q29kZShpbnZvY2F0aW9uKSB9KTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZEhhbmRsZXIoeyBjb21tYW5kVHlwZTogY29udHJhY3RzLlJlcXVlc3RWYWx1ZUluZm9zVHlwZSwgaGFuZGxlOiBpbnZvY2F0aW9uID0+IHRoaXMuaGFuZGxlUmVxdWVzdFZhbHVlSW5mb3MoaW52b2NhdGlvbikgfSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckNvbW1hbmRIYW5kbGVyKHsgY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5SZXF1ZXN0VmFsdWVUeXBlLCBoYW5kbGU6IGludm9jYXRpb24gPT4gdGhpcy5oYW5kbGVSZXF1ZXN0VmFsdWUoaW52b2NhdGlvbikgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FwdHVyZSA9IG5ldyBDb25zb2xlQ2FwdHVyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU3VibWl0Q29kZShpbnZvY2F0aW9uOiBJS2VybmVsQ29tbWFuZEludm9jYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBzdWJtaXRDb2RlID0gPGNvbnRyYWN0cy5TdWJtaXRDb2RlPmludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmQ7XHJcbiAgICAgICAgY29uc3QgY29kZSA9IHN1Ym1pdENvZGUuY29kZTtcclxuXHJcbiAgICAgICAgc3VwZXIua2VybmVsSW5mby5sb2NhbE5hbWU7Ly8/XHJcbiAgICAgICAgc3VwZXIua2VybmVsSW5mby51cmk7Ly8/XHJcbiAgICAgICAgc3VwZXIua2VybmVsSW5mby5yZW1vdGVVcmk7Ly8/XHJcbiAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5Db2RlU3VibWlzc2lvblJlY2VpdmVkVHlwZSwgZXZlbnQ6IHsgY29kZSB9LCBjb21tYW5kOiBpbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSB9KTtcclxuICAgICAgICBpbnZvY2F0aW9uLmNvbnRleHQuY29tbWFuZEVudmVsb3BlLnJvdXRpbmdTbGlwOy8vP1xyXG4gICAgICAgIHRoaXMuY2FwdHVyZS5rZXJuZWxJbnZvY2F0aW9uQ29udGV4dCA9IGludm9jYXRpb24uY29udGV4dDtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IEFzeW5jRnVuY3Rpb24gPSBldmFsKGBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYXN5bmMgZnVuY3Rpb24oKXt9KS5jb25zdHJ1Y3RvcmApO1xyXG4gICAgICAgICAgICBjb25zdCBldmFsdWF0b3IgPSBBc3luY0Z1bmN0aW9uKFwiY29uc29sZVwiLCBjb2RlKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgZXZhbHVhdG9yKHRoaXMuY2FwdHVyZSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXRWYWx1ZShyZXN1bHQsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudDogY29udHJhY3RzLlJldHVyblZhbHVlUHJvZHVjZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBbZm9ybWF0dGVkVmFsdWVdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5SZXR1cm5WYWx1ZVByb2R1Y2VkVHlwZSwgZXZlbnQsIGNvbW1hbmQ6IGludm9jYXRpb24uY29tbWFuZEVudmVsb3BlIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBlOy8vP1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgdGhpcy5jYXB0dXJlLmtlcm5lbEludm9jYXRpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVJlcXVlc3RWYWx1ZUluZm9zKGludm9jYXRpb246IElLZXJuZWxDb21tYW5kSW52b2NhdGlvbik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlSW5mb3M6IGNvbnRyYWN0cy5LZXJuZWxWYWx1ZUluZm9bXSA9IHRoaXMuYWxsTG9jYWxWYXJpYWJsZU5hbWVzKCkuZmlsdGVyKHYgPT4gIXRoaXMuc3VwcHJlc3NlZExvY2Fscy5oYXModikpLm1hcCh2ID0+ICh7IG5hbWU6IHYsIHByZWZlcnJlZE1pbWVUeXBlczogW10gfSkpO1xyXG4gICAgICAgIGNvbnN0IGV2ZW50OiBjb250cmFjdHMuVmFsdWVJbmZvc1Byb2R1Y2VkID0ge1xyXG4gICAgICAgICAgICB2YWx1ZUluZm9zXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpbnZvY2F0aW9uLmNvbnRleHQucHVibGlzaCh7IGV2ZW50VHlwZTogY29udHJhY3RzLlZhbHVlSW5mb3NQcm9kdWNlZFR5cGUsIGV2ZW50LCBjb21tYW5kOiBpbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSB9KTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVSZXF1ZXN0VmFsdWUoaW52b2NhdGlvbjogSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdFZhbHVlID0gPGNvbnRyYWN0cy5SZXF1ZXN0VmFsdWU+aW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUuY29tbWFuZDtcclxuICAgICAgICBjb25zdCByYXdWYWx1ZSA9IHRoaXMuZ2V0TG9jYWxWYXJpYWJsZShyZXF1ZXN0VmFsdWUubmFtZSk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXRWYWx1ZShyYXdWYWx1ZSwgcmVxdWVzdFZhbHVlLm1pbWVUeXBlIHx8ICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcmV0dXJuaW5nICR7SlNPTi5zdHJpbmdpZnkoZm9ybWF0dGVkVmFsdWUpfSBmb3IgJHtyZXF1ZXN0VmFsdWUubmFtZX1gKTtcclxuICAgICAgICBjb25zdCBldmVudDogY29udHJhY3RzLlZhbHVlUHJvZHVjZWQgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IHJlcXVlc3RWYWx1ZS5uYW1lLFxyXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5WYWx1ZVByb2R1Y2VkVHlwZSwgZXZlbnQsIGNvbW1hbmQ6IGludm9jYXRpb24uY29tbWFuZEVudmVsb3BlIH0pO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFsbExvY2FsVmFyaWFibGVOYW1lcygpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGdsb2JhbFRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoPGFueT5nbG9iYWxUaGlzKVtrZXldICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmVycm9yKGBlcnJvciBnZXR0aW5nIHZhbHVlIGZvciAke2tleX0gOiAke2V9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmVycm9yKGBlcnJvciBzY2FubmluZyBnbG9ibGEgdmFyaWFibGVzIDogJHtlfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldExvY2FsVmFyaWFibGUobmFtZTogc3RyaW5nKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKDxhbnk+Z2xvYmFsVGhpcylbbmFtZV07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRWYWx1ZShhcmc6IGFueSwgbWltZVR5cGU6IHN0cmluZyk6IGNvbnRyYWN0cy5Gb3JtYXR0ZWRWYWx1ZSB7XHJcbiAgICBsZXQgdmFsdWU6IHN0cmluZztcclxuXHJcbiAgICBzd2l0Y2ggKG1pbWVUeXBlKSB7XHJcbiAgICAgICAgY2FzZSAndGV4dC9wbGFpbic6XHJcbiAgICAgICAgICAgIHZhbHVlID0gYXJnPy50b1N0cmluZygpIHx8ICd1bmRlZmluZWQnO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdhcHBsaWNhdGlvbi9qc29uJzpcclxuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeShhcmcpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIG1pbWUgdHlwZTogJHttaW1lVHlwZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1pbWVUeXBlLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgfTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgS2VybmVsLCBJS2VybmVsQ29tbWFuZEhhbmRsZXIsIElLZXJuZWxDb21tYW5kSW52b2NhdGlvbiwgZ2V0S2VybmVsVXJpLCBLZXJuZWxUeXBlIH0gZnJvbSBcIi4va2VybmVsXCI7XHJcbmltcG9ydCAqIGFzIGNvbm5lY3Rpb24gZnJvbSBcIi4vY29ubmVjdGlvblwiO1xyXG5pbXBvcnQgeyBQcm9taXNlQ29tcGxldGlvblNvdXJjZSB9IGZyb20gXCIuL3Byb21pc2VDb21wbGV0aW9uU291cmNlXCI7XHJcbmltcG9ydCB7IEtlcm5lbEludm9jYXRpb25Db250ZXh0IH0gZnJvbSBcIi4va2VybmVsSW52b2NhdGlvbkNvbnRleHRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQcm94eUtlcm5lbCBleHRlbmRzIEtlcm5lbCB7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3ZlcnJpZGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLCBwcml2YXRlIHJlYWRvbmx5IF9zZW5kZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciwgcHJpdmF0ZSByZWFkb25seSBfcmVjZWl2ZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFJlY2VpdmVyKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5rZXJuZWxUeXBlID0gS2VybmVsVHlwZS5wcm94eTtcclxuICAgIH1cclxuICAgIG92ZXJyaWRlIGdldENvbW1hbmRIYW5kbGVyKGNvbW1hbmRUeXBlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZFR5cGUpOiBJS2VybmVsQ29tbWFuZEhhbmRsZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRUeXBlLFxyXG4gICAgICAgICAgICBoYW5kbGU6IChpbnZvY2F0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tbWFuZEhhbmRsZXIoaW52b2NhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGVsZWdhdGVQdWJsaWNhdGlvbihlbnZlbG9wZTogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUsIGludm9jYXRpb25Db250ZXh0OiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBhbHJlYWR5QmVlblNlZW4gPSBmYWxzZTtcclxuICAgICAgICBpZiAoZW52ZWxvcGUucm91dGluZ1NsaXAgPT09IHVuZGVmaW5lZCB8fCAhZW52ZWxvcGUucm91dGluZ1NsaXAuZmluZChlID0+IGUgPT09IGdldEtlcm5lbFVyaSh0aGlzKSkpIHtcclxuICAgICAgICAgICAgY29ubmVjdGlvbi50cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGVudmVsb3BlLCBnZXRLZXJuZWxVcmkodGhpcykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFscmVhZHlCZWVuU2VlbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNTYW1lT3JpZ2luKGVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFscmVhZHlCZWVuU2Vlbikge1xyXG4gICAgICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQucHVibGlzaChlbnZlbG9wZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYXNTYW1lT3JpZ2luKGVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjb21tYW5kT3JpZ2luVXJpID0gZW52ZWxvcGUuY29tbWFuZD8uY29tbWFuZD8ub3JpZ2luVXJpID8/IHRoaXMua2VybmVsSW5mby51cmk7XHJcbiAgICAgICAgaWYgKGNvbW1hbmRPcmlnaW5VcmkgPT09IHRoaXMua2VybmVsSW5mby51cmkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29tbWFuZE9yaWdpblVyaSA9PT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZUtlcm5lbEluZm9Gcm9tRXZlbnQoa2VybmVsSW5mb1Byb2R1Y2VkOiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkKSB7XHJcbiAgICAgICAgY29ubmVjdGlvbi51cGRhdGVLZXJuZWxJbmZvKHRoaXMua2VybmVsSW5mbywga2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2NvbW1hbmRIYW5kbGVyKGNvbW1hbmRJbnZvY2F0aW9uOiBJS2VybmVsQ29tbWFuZEludm9jYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBjb21tYW5kVG9rZW4gPSBjb21tYW5kSW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUudG9rZW47XHJcbiAgICAgICAgY29uc3QgY29tbWFuZElkID0gY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmlkO1xyXG4gICAgICAgIGNvbnN0IGNvbXBsZXRpb25Tb3VyY2UgPSBuZXcgUHJvbWlzZUNvbXBsZXRpb25Tb3VyY2U8Y29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGU+KCk7XHJcbiAgICAgICAgLy8gZml4IDogaXMgdGhpcyB0aGUgcmlnaHQgd2F5PyBXZSBhcmUgdHJ5aW5nIHRvIGF2b2lkIGZvcndhcmRpbmcgZXZlbnRzIHdlIGp1c3QgZGlkIGZvcndhcmRcclxuICAgICAgICBsZXQgZXZlbnRTdWJzY3JpcHRpb24gPSB0aGlzLl9yZWNlaXZlci5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgICBuZXh0OiAoZW52ZWxvcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uLmlzS2VybmVsRXZlbnRFbnZlbG9wZShlbnZlbG9wZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW52ZWxvcGUuZXZlbnRUeXBlID09PSBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUuY29tbWFuZCA9PT0gbnVsbCB8fCBlbnZlbG9wZS5jb21tYW5kID09PSB1bmRlZmluZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtlcm5lbEluZm9Qcm9kdWNlZCA9IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPmVudmVsb3BlLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUtlcm5lbEluZm9Gcm9tRXZlbnQoa2VybmVsSW5mb1Byb2R1Y2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdWJsaXNoRXZlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudDogeyBrZXJuZWxJbmZvOiB0aGlzLmtlcm5lbEluZm8gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVudmVsb3BlLmNvbW1hbmQhLnRva2VuID09PSBjb21tYW5kVG9rZW4pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2VybmVsVXJpIG9mIGVudmVsb3BlLmNvbW1hbmQhLnJvdXRpbmdTbGlwISkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvbi50cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSwga2VybmVsVXJpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudmVsb3BlLmNvbW1hbmQhLnJvdXRpbmdTbGlwID0gY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLnJvdXRpbmdTbGlwOy8vP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGVudmVsb3BlLmV2ZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtlcm5lbEluZm9Qcm9kdWNlZCA9IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPmVudmVsb3BlLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8udXJpID09PSB0aGlzLmtlcm5lbEluZm8ucmVtb3RlVXJpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUtlcm5lbEluZm9Gcm9tRXZlbnQoa2VybmVsSW5mb1Byb2R1Y2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGVQdWJsaWNhdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7IGtlcm5lbEluZm86IHRoaXMua2VybmVsSW5mbyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0aW5nU2xpcDogZW52ZWxvcGUucm91dGluZ1NsaXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNvbW1hbmRJbnZvY2F0aW9uLmNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZVB1YmxpY2F0aW9uKGVudmVsb3BlLCBjb21tYW5kSW52b2NhdGlvbi5jb250ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGVQdWJsaWNhdGlvbihlbnZlbG9wZSwgY29tbWFuZEludm9jYXRpb24uY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIGNvbnRyYWN0cy5Db21tYW5kQ2FuY2VsbGVkVHlwZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgY29udHJhY3RzLkNvbW1hbmRGYWlsZWRUeXBlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBjb250cmFjdHMuQ29tbWFuZFN1Y2NlZWRlZFR5cGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcHJveHkgbmFtZT0ke3RoaXMubmFtZX1bbG9jYWwgdXJpOiR7dGhpcy5rZXJuZWxJbmZvLnVyaX0sIHJlbW90ZSB1cmk6JHt0aGlzLmtlcm5lbEluZm8ucmVtb3RlVXJpfV0gZmluaXNoZWQsIGVudmVsb3BlaWQ9JHtlbnZlbG9wZS5jb21tYW5kIS5pZH0sIGNvbW1hbmRpZD0ke2NvbW1hbmRJZH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW52ZWxvcGUuY29tbWFuZCEuaWQgPT09IGNvbW1hbmRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0aW9uU291cmNlLnJlc29sdmUoZW52ZWxvcGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGVQdWJsaWNhdGlvbihlbnZlbG9wZSwgY29tbWFuZEludm9jYXRpb24uY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlUHVibGljYXRpb24oZW52ZWxvcGUsIGNvbW1hbmRJbnZvY2F0aW9uLmNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmQuZGVzdGluYXRpb25VcmkgfHwgIWNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLm9yaWdpblVyaSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmQub3JpZ2luVXJpID8/PSB0aGlzLmtlcm5lbEluZm8udXJpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmQuZGVzdGluYXRpb25VcmkgPz89IHRoaXMua2VybmVsSW5mby5yZW1vdGVVcmk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5yb3V0aW5nU2xpcDsvLz9cclxuICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcHJveHkgJHt0aGlzLm5hbWV9W2xvY2FsIHVyaToke3RoaXMua2VybmVsSW5mby51cml9LCByZW1vdGUgdXJpOiR7dGhpcy5rZXJuZWxJbmZvLnJlbW90ZVVyaX1dIGZvcndhcmRpbmcgY29tbWFuZCAke2NvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5jb21tYW5kVHlwZX0gdG8gJHtjb21tYW5kSW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaX1gKTtcclxuICAgICAgICAgICAgdGhpcy5fc2VuZGVyLnNlbmQoY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlKTtcclxuICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcHJveHkgJHt0aGlzLm5hbWV9W2xvY2FsIHVyaToke3RoaXMua2VybmVsSW5mby51cml9LCByZW1vdGUgdXJpOiR7dGhpcy5rZXJuZWxJbmZvLnJlbW90ZVVyaX1dIGFib3V0IHRvIGF3YWl0IHdpdGggdG9rZW4gJHtjb21tYW5kVG9rZW59YCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVudmVudEVudmVsb3BlID0gYXdhaXQgY29tcGxldGlvblNvdXJjZS5wcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAoZW52ZW50RW52ZWxvcGUuZXZlbnRUeXBlID09PSBjb250cmFjdHMuQ29tbWFuZEZhaWxlZFR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRJbnZvY2F0aW9uLmNvbnRleHQuZmFpbCgoPGNvbnRyYWN0cy5Db21tYW5kRmFpbGVkPmVudmVudEVudmVsb3BlLmV2ZW50KS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBwcm94eSAke3RoaXMubmFtZX1bbG9jYWwgdXJpOiR7dGhpcy5rZXJuZWxJbmZvLnVyaX0sIHJlbW90ZSB1cmk6JHt0aGlzLmtlcm5lbEluZm8ucmVtb3RlVXJpfV0gZG9uZSBhd2FpdGluZyB3aXRoIHRva2VuICR7Y29tbWFuZFRva2VufWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb21tYW5kSW52b2NhdGlvbi5jb250ZXh0LmZhaWwoKDxhbnk+ZSkubWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkge1xyXG4gICAgICAgICAgICBldmVudFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgQ29tcG9zaXRlS2VybmVsIH0gZnJvbSAnLi9jb21wb3NpdGVLZXJuZWwnO1xyXG5pbXBvcnQgKiBhcyBjb250cmFjdHMgZnJvbSAnLi9jb250cmFjdHMnO1xyXG5pbXBvcnQgKiBhcyBjb25uZWN0aW9uIGZyb20gJy4vY29ubmVjdGlvbic7XHJcbmltcG9ydCB7IEtlcm5lbCB9IGZyb20gJy4va2VybmVsJztcclxuaW1wb3J0IHsgUHJveHlLZXJuZWwgfSBmcm9tICcuL3Byb3h5S2VybmVsJztcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xyXG5pbXBvcnQgeyBLZXJuZWxTY2hlZHVsZXIgfSBmcm9tICcuL2tlcm5lbFNjaGVkdWxlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgS2VybmVsSG9zdCB7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9yZW1vdGVVcmlUb0tlcm5lbCA9IG5ldyBNYXA8c3RyaW5nLCBLZXJuZWw+KCk7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF91cmlUb0tlcm5lbCA9IG5ldyBNYXA8c3RyaW5nLCBLZXJuZWw+KCk7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9rZXJuZWxUb0tlcm5lbEluZm8gPSBuZXcgTWFwPEtlcm5lbCwgY29udHJhY3RzLktlcm5lbEluZm8+KCk7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF91cmk6IHN0cmluZztcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3NjaGVkdWxlcjogS2VybmVsU2NoZWR1bGVyPGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGU+O1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsOiBDb21wb3NpdGVLZXJuZWw7XHJcbiAgICBwcml2YXRlIF9kZWZhdWx0Q29ubmVjdG9yOiBjb25uZWN0aW9uLkNvbm5lY3RvcjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Nvbm5lY3RvcnM6IGNvbm5lY3Rpb24uQ29ubmVjdG9yW10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihrZXJuZWw6IENvbXBvc2l0ZUtlcm5lbCwgc2VuZGVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIsIHJlY2VpdmVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciwgaG9zdFVyaTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fa2VybmVsID0ga2VybmVsO1xyXG4gICAgICAgIHRoaXMuX3VyaSA9IGhvc3RVcmkgfHwgXCJrZXJuZWw6Ly92c2NvZGVcIjtcclxuICAgICAgICB0aGlzLl9rZXJuZWwuaG9zdCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IEtlcm5lbFNjaGVkdWxlcjxjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlPigpO1xyXG5cclxuICAgICAgICB0aGlzLl9kZWZhdWx0Q29ubmVjdG9yID0gbmV3IGNvbm5lY3Rpb24uQ29ubmVjdG9yKHsgc2VuZGVyLCByZWNlaXZlciB9KTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JzLnB1c2godGhpcy5fZGVmYXVsdENvbm5lY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB1cmkoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdXJpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRLZXJuZWxCeVJlbW90ZVVyaShyZW1vdGVVcmk6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZVVyaVRvS2VybmVsLmdldChyZW1vdGVVcmkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlnZXRLZXJuZWxCeU9yaWdpblVyaShvcmlnaW5Vcmk6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VyaVRvS2VybmVsLmdldChvcmlnaW5VcmkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRLZXJuZWxJbmZvKGtlcm5lbDogS2VybmVsKTogY29udHJhY3RzLktlcm5lbEluZm8gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxUb0tlcm5lbEluZm8uZ2V0KGtlcm5lbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZEtlcm5lbEluZm8oa2VybmVsOiBLZXJuZWwsIGtlcm5lbEluZm86IGNvbnRyYWN0cy5LZXJuZWxJbmZvKSB7XHJcblxyXG4gICAgICAgIGtlcm5lbEluZm8udXJpID0gYCR7dGhpcy5fdXJpfS8ke2tlcm5lbC5uYW1lfWA7Ly8/XHJcbiAgICAgICAgdGhpcy5fa2VybmVsVG9LZXJuZWxJbmZvLnNldChrZXJuZWwsIGtlcm5lbEluZm8pO1xyXG4gICAgICAgIHRoaXMuX3VyaVRvS2VybmVsLnNldChrZXJuZWxJbmZvLnVyaSwga2VybmVsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0S2VybmVsKGtlcm5lbENvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IEtlcm5lbCB7XHJcblxyXG4gICAgICAgIGNvbnN0IHVyaVRvTG9va3VwID0ga2VybmVsQ29tbWFuZEVudmVsb3BlLmNvbW1hbmQuZGVzdGluYXRpb25VcmkgPz8ga2VybmVsQ29tbWFuZEVudmVsb3BlLmNvbW1hbmQub3JpZ2luVXJpO1xyXG4gICAgICAgIGxldCBrZXJuZWw6IEtlcm5lbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAodXJpVG9Mb29rdXApIHtcclxuICAgICAgICAgICAga2VybmVsID0gdGhpcy5fa2VybmVsLmZpbmRLZXJuZWxCeVVyaSh1cmlUb0xvb2t1cCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWtlcm5lbCkge1xyXG4gICAgICAgICAgICBpZiAoa2VybmVsQ29tbWFuZEVudmVsb3BlLmNvbW1hbmQudGFyZ2V0S2VybmVsTmFtZSkge1xyXG4gICAgICAgICAgICAgICAga2VybmVsID0gdGhpcy5fa2VybmVsLmZpbmRLZXJuZWxCeU5hbWUoa2VybmVsQ29tbWFuZEVudmVsb3BlLmNvbW1hbmQudGFyZ2V0S2VybmVsTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGtlcm5lbCA/Pz0gdGhpcy5fa2VybmVsO1xyXG4gICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYFVzaW5nIEtlcm5lbCAke2tlcm5lbC5uYW1lfWApO1xyXG4gICAgICAgIHJldHVybiBrZXJuZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3RQcm94eUtlcm5lbE9uRGVmYXVsdENvbm5lY3Rvcihsb2NhbE5hbWU6IHN0cmluZywgcmVtb3RlS2VybmVsVXJpPzogc3RyaW5nLCBhbGlhc2VzPzogc3RyaW5nW10pOiBQcm94eUtlcm5lbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdFByb3h5S2VybmVsT25Db25uZWN0b3IobG9jYWxOYW1lLCB0aGlzLl9kZWZhdWx0Q29ubmVjdG9yLnNlbmRlciwgdGhpcy5fZGVmYXVsdENvbm5lY3Rvci5yZWNlaXZlciwgcmVtb3RlS2VybmVsVXJpLCBhbGlhc2VzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJ5QWRkQ29ubmVjdG9yKGNvbm5lY3RvcjogeyBzZW5kZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciwgcmVjZWl2ZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFJlY2VpdmVyLCByZW1vdGVVcmlzPzogc3RyaW5nW10gfSkge1xyXG4gICAgICAgIGlmICghY29ubmVjdG9yLnJlbW90ZVVyaXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdG9ycy5wdXNoKG5ldyBjb25uZWN0aW9uLkNvbm5lY3Rvcihjb25uZWN0b3IpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZm91bmQgPSBjb25uZWN0b3IucmVtb3RlVXJpcyEuZmluZCh1cmkgPT4gdGhpcy5fY29ubmVjdG9ycy5maW5kKGMgPT4gYy5jYW5SZWFjaCh1cmkpKSk7XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RvcnMucHVzaChuZXcgY29ubmVjdGlvbi5Db25uZWN0b3IoY29ubmVjdG9yKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25uZWN0UHJveHlLZXJuZWwobG9jYWxOYW1lOiBzdHJpbmcsIHJlbW90ZUtlcm5lbFVyaTogc3RyaW5nLCBhbGlhc2VzPzogc3RyaW5nW10pOiBQcm94eUtlcm5lbCB7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yczsvLz9cclxuICAgICAgICBjb25zdCBjb25uZWN0b3IgPSB0aGlzLl9jb25uZWN0b3JzLmZpbmQoYyA9PiBjLmNhblJlYWNoKHJlbW90ZUtlcm5lbFVyaSkpO1xyXG4gICAgICAgIGlmICghY29ubmVjdG9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgY29ubmVjdG9yIHRvIHJlYWNoICR7cmVtb3RlS2VybmVsVXJpfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2VybmVsID0gbmV3IFByb3h5S2VybmVsKGxvY2FsTmFtZSwgY29ubmVjdG9yLnNlbmRlciwgY29ubmVjdG9yLnJlY2VpdmVyKTtcclxuICAgICAgICBrZXJuZWwua2VybmVsSW5mby5yZW1vdGVVcmkgPSByZW1vdGVLZXJuZWxVcmk7XHJcbiAgICAgICAgdGhpcy5fa2VybmVsLmFkZChrZXJuZWwsIGFsaWFzZXMpO1xyXG4gICAgICAgIHJldHVybiBrZXJuZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb25uZWN0UHJveHlLZXJuZWxPbkNvbm5lY3Rvcihsb2NhbE5hbWU6IHN0cmluZywgc2VuZGVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIsIHJlY2VpdmVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciwgcmVtb3RlS2VybmVsVXJpPzogc3RyaW5nLCBhbGlhc2VzPzogc3RyaW5nW10pOiBQcm94eUtlcm5lbCB7XHJcbiAgICAgICAgbGV0IGtlcm5lbCA9IG5ldyBQcm94eUtlcm5lbChsb2NhbE5hbWUsIHNlbmRlciwgcmVjZWl2ZXIpO1xyXG4gICAgICAgIGtlcm5lbC5rZXJuZWxJbmZvLnJlbW90ZVVyaSA9IHJlbW90ZUtlcm5lbFVyaTtcclxuICAgICAgICB0aGlzLl9rZXJuZWwuYWRkKGtlcm5lbCwgYWxpYXNlcyk7XHJcbiAgICAgICAgcmV0dXJuIGtlcm5lbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJ5R2V0Q29ubmVjdG9yKHJlbW90ZVVyaTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3RvcnMuZmluZChjID0+IGMuY2FuUmVhY2gocmVtb3RlVXJpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbm5lY3QoKSB7XHJcbiAgICAgICAgdGhpcy5fa2VybmVsLnN1YnNjcmliZVRvS2VybmVsRXZlbnRzKGUgPT4ge1xyXG4gICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBLZXJuZWxIb3N0IGZvcndhcmRpbmcgZXZlbnQ6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRDb25uZWN0b3Iuc2VuZGVyLnNlbmQoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2RlZmF1bHRDb25uZWN0b3IucmVjZWl2ZXIuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgbmV4dDogKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU6IGNvbm5lY3Rpb24uS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24uaXNLZXJuZWxDb21tYW5kRW52ZWxvcGUoa2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBLZXJuZWxIb3N0IGRpc3BhY3RoaW5nIGNvbW1hbmQ6ICR7SlNPTi5zdHJpbmdpZnkoa2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSl9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnJ1bkFzeW5jKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUsIGNvbW1hbmRFbnZlbG9wZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMuX2tlcm5lbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtlcm5lbC5zZW5kKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdENvbm5lY3Rvci5zZW5kZXIuc2VuZCh7IGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbFJlYWR5VHlwZSwgZXZlbnQ6IHt9LCByb3V0aW5nU2xpcDogW3RoaXMuX2tlcm5lbC5rZXJuZWxJbmZvLnVyaSFdIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnB1Ymxpc2hLZXJuZUluZm8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHVibGlzaEtlcm5lSW5mbygpIHtcclxuXHJcbiAgICAgICAgY29uc3QgZXZlbnRzID0gdGhpcy5nZXRLZXJuZWxJbmZvUHJvZHVjZWQoKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVmYXVsdENvbm5lY3Rvci5zZW5kZXIuc2VuZChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRLZXJuZWxJbmZvUHJvZHVjZWQoKTogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGVbXSB7XHJcbiAgICAgICAgbGV0IGV2ZW50czogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGVbXSA9IFtdO1xyXG4gICAgICAgIGV2ZW50cy5wdXNoKHsgZXZlbnRUeXBlOiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSwgZXZlbnQ6IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPnsga2VybmVsSW5mbzogdGhpcy5fa2VybmVsLmtlcm5lbEluZm8gfSwgcm91dGluZ1NsaXA6IFt0aGlzLl9rZXJuZWwua2VybmVsSW5mby51cmkhXSB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2VybmVsIG9mIHRoaXMuX2tlcm5lbC5jaGlsZEtlcm5lbHMpIHtcclxuICAgICAgICAgICAgZXZlbnRzLnB1c2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLCBldmVudDogPGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWQ+eyBrZXJuZWxJbmZvOiBrZXJuZWwua2VybmVsSW5mbyB9LCByb3V0aW5nU2xpcDogW2tlcm5lbC5rZXJuZWxJbmZvLnVyaSFdIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGV2ZW50cztcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgQ29tcG9zaXRlS2VybmVsIH0gZnJvbSBcIi4uL2NvbXBvc2l0ZUtlcm5lbFwiO1xyXG5pbXBvcnQgeyBKYXZhc2NyaXB0S2VybmVsIH0gZnJvbSBcIi4uL2phdmFzY3JpcHRLZXJuZWxcIjtcclxuaW1wb3J0IHsgTG9nRW50cnksIExvZ2dlciB9IGZyb20gXCIuLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgS2VybmVsSG9zdCB9IGZyb20gXCIuLi9rZXJuZWxIb3N0XCI7XHJcbmltcG9ydCAqIGFzIHJ4anMgZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0ICogYXMgY29ubmVjdGlvbiBmcm9tIFwiLi4vY29ubmVjdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBjb250cmFjdHMgZnJvbSBcIi4uL2NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvc3QoXHJcbiAgICBnbG9iYWw6IGFueSxcclxuICAgIGNvbXBvc2l0ZUtlcm5lbE5hbWU6IHN0cmluZyxcclxuICAgIGNvbmZpZ3VyZVJlcXVpcmU6IChpbnRlcmFjdGl2ZTogYW55KSA9PiB2b2lkLFxyXG4gICAgbG9nTWVzc2FnZTogKGVudHJ5OiBMb2dFbnRyeSkgPT4gdm9pZCxcclxuICAgIGxvY2FsVG9SZW1vdGU6IHJ4anMuT2JzZXJ2ZXI8Y29ubmVjdGlvbi5LZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlPixcclxuICAgIHJlbW90ZVRvTG9jYWw6IHJ4anMuT2JzZXJ2YWJsZTxjb25uZWN0aW9uLktlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+LFxyXG4gICAgb25SZWFkeTogKCkgPT4gdm9pZCkge1xyXG4gICAgTG9nZ2VyLmNvbmZpZ3VyZShjb21wb3NpdGVLZXJuZWxOYW1lLCBsb2dNZXNzYWdlKTtcclxuXHJcbiAgICBnbG9iYWwuaW50ZXJhY3RpdmUgPSB7fTtcclxuICAgIGNvbmZpZ3VyZVJlcXVpcmUoZ2xvYmFsLmludGVyYWN0aXZlKTtcclxuXHJcbiAgICBjb25zdCBjb21wb3NpdGVLZXJuZWwgPSBuZXcgQ29tcG9zaXRlS2VybmVsKGNvbXBvc2l0ZUtlcm5lbE5hbWUpO1xyXG4gICAgY29uc3Qga2VybmVsSG9zdCA9IG5ldyBLZXJuZWxIb3N0KGNvbXBvc2l0ZUtlcm5lbCwgY29ubmVjdGlvbi5LZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIuRnJvbU9ic2VydmVyKGxvY2FsVG9SZW1vdGUpLCBjb25uZWN0aW9uLktlcm5lbENvbW1hbmRBbmRFdmVudFJlY2VpdmVyLkZyb21PYnNlcnZhYmxlKHJlbW90ZVRvTG9jYWwpLCBga2VybmVsOi8vJHtjb21wb3NpdGVLZXJuZWxOYW1lfWApO1xyXG4gICAgcmVtb3RlVG9Mb2NhbC5zdWJzY3JpYmUoe1xyXG4gICAgICAgIG5leHQ6IChlbnZlbG9wZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY29ubmVjdGlvbi5pc0tlcm5lbEV2ZW50RW52ZWxvcGUoZW52ZWxvcGUpICYmIGVudmVsb3BlLmV2ZW50VHlwZSA9PT0gY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtlcm5lbEluZm9Qcm9kdWNlZCA9IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPmVudmVsb3BlLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbi5lbnN1cmVPclVwZGF0ZVByb3h5Rm9yS2VybmVsSW5mbyhrZXJuZWxJbmZvUHJvZHVjZWQsIGNvbXBvc2l0ZUtlcm5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyB1c2UgY29tcG9zaXRlIGtlcm5lbCBhcyByb290XHJcblxyXG4gICAgZ2xvYmFsLmtlcm5lbCA9IHtcclxuICAgICAgICBnZXQgcm9vdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZUtlcm5lbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGdsb2JhbFtjb21wb3NpdGVLZXJuZWxOYW1lXSA9IHtcclxuICAgICAgICBjb21wb3NpdGVLZXJuZWwsXHJcbiAgICAgICAga2VybmVsSG9zdCxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QganNLZXJuZWwgPSBuZXcgSmF2YXNjcmlwdEtlcm5lbCgpO1xyXG4gICAgY29tcG9zaXRlS2VybmVsLmFkZChqc0tlcm5lbCwgW1wianNcIl0pO1xyXG5cclxuICAgIGtlcm5lbEhvc3QuY29ubmVjdCgpO1xyXG5cclxuICAgIG9uUmVhZHkoKTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgZnJvbnRFbmRIb3N0IGZyb20gJy4vZnJvbnRFbmRIb3N0JztcclxuaW1wb3J0ICogYXMgcnhqcyBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgKiBhcyBjb25uZWN0aW9uIGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgS2VybmVsSG9zdCB9IGZyb20gJy4uL2tlcm5lbEhvc3QnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShnbG9iYWw/OiBhbnkpIHtcclxuICAgIGlmICghZ2xvYmFsKSB7XHJcbiAgICAgICAgZ2xvYmFsID0gd2luZG93O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlbW90ZVRvTG9jYWwgPSBuZXcgcnhqcy5TdWJqZWN0PGNvbm5lY3Rpb24uS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT4oKTtcclxuICAgIGNvbnN0IGxvY2FsVG9SZW1vdGUgPSBuZXcgcnhqcy5TdWJqZWN0PGNvbm5lY3Rpb24uS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT4oKTtcclxuXHJcbiAgICBsb2NhbFRvUmVtb3RlLnN1YnNjcmliZSh7XHJcbiAgICAgICAgbmV4dDogZW52ZWxvcGUgPT4ge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHBvc3RLZXJuZWxNZXNzYWdlKHsgZW52ZWxvcGUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgb25EaWRSZWNlaXZlS2VybmVsTWVzc2FnZSgoYXJnOiBhbnkpID0+IHtcclxuICAgICAgICBpZiAoYXJnLmVudmVsb3BlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVudmVsb3BlID0gPGNvbm5lY3Rpb24uS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT48YW55PihhcmcuZW52ZWxvcGUpO1xyXG4gICAgICAgICAgICBpZiAoY29ubmVjdGlvbi5pc0tlcm5lbEV2ZW50RW52ZWxvcGUoZW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBjaGFubmVsIGdvdCAke2VudmVsb3BlLmV2ZW50VHlwZX0gd2l0aCB0b2tlbiAke2VudmVsb3BlLmNvbW1hbmQ/LnRva2VufSBhbmQgaWQgJHtlbnZlbG9wZS5jb21tYW5kPy5pZH1gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVtb3RlVG9Mb2NhbC5uZXh0KGVudmVsb3BlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmcm9udEVuZEhvc3QuY3JlYXRlSG9zdChcclxuICAgICAgICBnbG9iYWwsXHJcbiAgICAgICAgJ3dlYnZpZXcnLFxyXG4gICAgICAgIGNvbmZpZ3VyZVJlcXVpcmUsXHJcbiAgICAgICAgZW50cnkgPT4ge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHBvc3RLZXJuZWxNZXNzYWdlKHsgbG9nRW50cnk6IGVudHJ5IH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9jYWxUb1JlbW90ZSxcclxuICAgICAgICByZW1vdGVUb0xvY2FsLFxyXG4gICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qga2VybmVsSW5mb1Byb2R1Y2VkID0gKDxLZXJuZWxIb3N0PihnbG9iYWxbJ3dlYnZpZXcnXS5rZXJuZWxIb3N0KSkuZ2V0S2VybmVsSW5mb1Byb2R1Y2VkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhvc3RVcmkgPSAoPEtlcm5lbEhvc3Q+KGdsb2JhbFsnd2VidmlldyddLmtlcm5lbEhvc3QpKS51cmk7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgcG9zdEtlcm5lbE1lc3NhZ2UoeyBwcmVsb2FkQ29tbWFuZDogJyMhY29ubmVjdCcsIGtlcm5lbEluZm9Qcm9kdWNlZCwgaG9zdFVyaSB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29uZmlndXJlUmVxdWlyZShpbnRlcmFjdGl2ZTogYW55KSB7XHJcbiAgICBpZiAoKHR5cGVvZiAocmVxdWlyZSkgIT09IHR5cGVvZiAoRnVuY3Rpb24pKSB8fCAodHlwZW9mICgoPGFueT5yZXF1aXJlKS5jb25maWcpICE9PSB0eXBlb2YgKEZ1bmN0aW9uKSkpIHtcclxuICAgICAgICBsZXQgcmVxdWlyZV9zY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICByZXF1aXJlX3NjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsICdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9yZXF1aXJlLmpzLzIuMy42L3JlcXVpcmUubWluLmpzJyk7XHJcbiAgICAgICAgcmVxdWlyZV9zY3JpcHQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvamF2YXNjcmlwdCcpO1xyXG4gICAgICAgIHJlcXVpcmVfc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaW50ZXJhY3RpdmUuY29uZmlndXJlUmVxdWlyZSA9IChjb25maW5nOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoPGFueT5yZXF1aXJlKS5jb25maWcoY29uZmluZykgfHwgcmVxdWlyZTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgfTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHJlcXVpcmVfc2NyaXB0KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGludGVyYWN0aXZlLmNvbmZpZ3VyZVJlcXVpcmUgPSAoY29uZmluZzogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT5yZXF1aXJlKS5jb25maWcoY29uZmluZykgfHwgcmVxdWlyZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25maWd1cmUod2luZG93KTtcclxuIl0sIm5hbWVzIjpbIlN5bWJvbF9vYnNlcnZhYmxlIiwicnhqcy5TdWJqZWN0IiwiY29udHJhY3RzLkNvbW1hbmRTdWNjZWVkZWRUeXBlIiwiY29udHJhY3RzLkNvbW1hbmRGYWlsZWRUeXBlIiwiY29udHJhY3RzLlJlcXVlc3RLZXJuZWxJbmZvVHlwZSIsImNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlIiwicnhqcy5tYXAiLCJjb250cmFjdHMuRGlzcGxheWVkVmFsdWVQcm9kdWNlZFR5cGUiLCJjb250cmFjdHMuU3VibWl0Q29kZVR5cGUiLCJjb250cmFjdHMuUmVxdWVzdFZhbHVlSW5mb3NUeXBlIiwiY29udHJhY3RzLlJlcXVlc3RWYWx1ZVR5cGUiLCJjb250cmFjdHMuQ29kZVN1Ym1pc3Npb25SZWNlaXZlZFR5cGUiLCJjb250cmFjdHMuUmV0dXJuVmFsdWVQcm9kdWNlZFR5cGUiLCJjb250cmFjdHMuVmFsdWVJbmZvc1Byb2R1Y2VkVHlwZSIsImNvbnRyYWN0cy5WYWx1ZVByb2R1Y2VkVHlwZSIsImNvbm5lY3Rpb24udHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcCIsImNvbm5lY3Rpb24udXBkYXRlS2VybmVsSW5mbyIsImNvbm5lY3Rpb24uaXNLZXJuZWxFdmVudEVudmVsb3BlIiwiY29udHJhY3RzLkNvbW1hbmRDYW5jZWxsZWRUeXBlIiwiY29ubmVjdGlvbi5Db25uZWN0b3IiLCJjb25uZWN0aW9uLmlzS2VybmVsQ29tbWFuZEVudmVsb3BlIiwiY29udHJhY3RzLktlcm5lbFJlYWR5VHlwZSIsImNvbm5lY3Rpb24uS2VybmVsQ29tbWFuZEFuZEV2ZW50U2VuZGVyIiwiY29ubmVjdGlvbi5LZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciIsImNvbm5lY3Rpb24uZW5zdXJlT3JVcGRhdGVQcm94eUZvcktlcm5lbEluZm8iLCJmcm9udEVuZEhvc3QuY3JlYXRlSG9zdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBTyxTQUFTLFVBQVUsQ0FBQyxL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
