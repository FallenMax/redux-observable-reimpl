"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addThenRandom = function (action$, store) {
    return action$
        .filter(function (val) { return val.type === 'add'; })
        .delay(1000)
        .map(function (s) {
        return {
            type: 'random',
            payload: s.payload * Math.random(),
        };
    });
};
exports.multiplyThenNothing = function (action$, store) {
    return action$
        .filter(function (val) { return val.type === 'multiply'; })
        .delay(1000)
        .map(function (_) { return ({
        type: 'nothing',
        payload: null,
    }); });
};
exports.epic = [exports.addThenRandom, exports.multiplyThenNothing];
