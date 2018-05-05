"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = {
    value: 2,
};
// reducer
exports.reducer = function (state, action) {
    switch (action.type) {
        case 'multiply':
            return __assign({}, state, { value: state.value * action.payload });
        case 'divide':
            return __assign({}, state, { value: state.value / action.payload });
        default:
            return state;
    }
};
