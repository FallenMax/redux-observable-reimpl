"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
var store = store_1.createStore();
// -------------- view -------------
var view = function (state) {
    var val1 = state.addSubtract.value;
    var val2 = state.multiDivide.value;
    console.log('view', { val1: val1, val2: val2 });
};
store.subscribe(view);
setTimeout(function () {
    store.dispatch({
        type: 'add',
        payload: 1,
    });
}, 1000);
setTimeout(function () {
    console.log('exit');
}, 5000);
// setTimeout(function() {
//   store.dispatch({
//     type: 'multiply',
//     payload: 2,
//   })
// }, 2000)
