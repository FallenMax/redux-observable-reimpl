"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// epic
exports.randomThenMultiply = function (action$, store) {
    return action$
        .filter(function (val) { return val.type === 'random'; })
        .delay(1000)
        .map(function (s) {
        return {
            type: 'multiply',
            payload: s.payload,
        };
    })
        .log('addThenRandom');
};
exports.epic = [exports.randomThenMultiply];
