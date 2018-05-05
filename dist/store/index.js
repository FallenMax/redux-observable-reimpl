"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("../util/stream");
var epic_1 = require("./epic");
var reducer_1 = require("./reducer");
exports.createStore = function () {
    var state = reducer_1.state;
    var listeners = [];
    var epicIn$ = stream_1.Stream().log('epic in');
    var reducer = function (state, action) {
        // @ts-ignore
        return Object.entries(state).reduce(
        // @ts-ignore
        function (prev, _a) {
            var key = _a[0], stateSlice = _a[1];
            // @ts-ignore
            return Object.assign(prev, (_b = {},
                // @ts-ignore
                _b[key] = reducer_1.reducers[key](stateSlice, action),
                _b));
            var _b;
        }, {});
    };
    var getState = function () {
        return state;
    };
    var subscribe = function (listener) {
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
            listener(state);
        }
        return function () {
            unsubscribe(listener);
        };
    };
    var unsubscribe = function (listener) {
        var index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };
    var dispatch = function (action) {
        console.log('action ', action);
        state = reducer(state, action);
        listeners.forEach(function (l) { return l(state); });
        // effects
        epicIn$(action);
    };
    var store = {
        getState: getState,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        dispatch: dispatch,
    };
    var epicOut$ = epic_1.rootEpic(epicIn$, store)
        .log('epic out')
        .subscribe(store.dispatch);
    return store;
};
