"use strict";
// ------------ Stream: core ------------
Object.defineProperty(exports, "__esModule", { value: true });
// ------------ Stream: util ------------
var isStream = function (o) {
    return o && o._isStream;
};
var hasStarted = function (stream$) { return stream$._started; };
var proto = {};
exports.subscribe = function (stream$, listener, emitOnSubscribe) {
    if (emitOnSubscribe === void 0) { emitOnSubscribe = true; }
    if (emitOnSubscribe && hasStarted(stream$)) {
        listener(stream$());
    }
    stream$._listeners.push(listener);
};
proto.subscribe = function (listener, emitOnSubscribe) {
    return exports.subscribe(this, listener, emitOnSubscribe);
};
var updateStream = function (stream$, val) {
    stream$._value = val;
    stream$._started = true;
    stream$._changed = true;
    stream$._dependents.forEach(function (dep) { return dep.updateDependent(val); });
};
var flushStream = function (stream$) {
    if (stream$._changed) {
        stream$._changed = false;
        if (hasStarted(stream$)) {
            stream$._listeners.forEach(function (l) { return l(stream$()); });
        }
        stream$._dependents.forEach(function (dep) { return dep.flushDependent(); });
    }
};
exports.Stream = (function (init) {
    var stream$ = function (val) {
        if (typeof val === 'undefined') {
            return stream$._value;
        }
        else {
            stream$._started = true;
            updateStream(stream$, val);
            flushStream(stream$);
        }
    };
    stream$._isStream = true;
    stream$._started = !(typeof init === 'undefined');
    stream$._value = init;
    stream$._name = '';
    stream$._changed = false;
    stream$._listeners = [];
    stream$._dependents = [];
    // @ts-ignore
    Object.assign(stream$, proto);
    return stream$;
});
// ------------ Stream.combine ------------
function combine(combiner, streams) {
    var cached = streams.map(function (stream$) { return stream$(); });
    var allHasValue = function (arr) {
        return arr.every(function (elem) { return typeof elem !== 'undefined'; });
    };
    var combined$ = exports.Stream(allHasValue(cached) ? combiner.apply(void 0, cached) : undefined);
    streams.forEach(function (stream, i) {
        stream._dependents.push({
            updateDependent: function (val) {
                cached[i] = val;
                if (allHasValue(cached)) {
                    updateStream(combined$, combiner.apply(void 0, cached));
                }
            },
            flushDependent: function () {
                flushStream(combined$);
            },
        });
    });
    return combined$;
}
exports.combine = combine;
exports.Stream.combine = combine;
// ------------ Stream.merge --------------
function merge(streams) {
    var merged$ = exports.Stream();
    streams.forEach(function (stream$) {
        exports.subscribe(stream$, function (val) { return merged$(val); });
    });
    return merged$;
}
exports.merge = merge;
exports.Stream.merge = merge;
// ------------ Stream::log --------------
exports.log = function log(name, stream$) {
    stream$._name = name;
    exports.subscribe(stream$, function (val) {
        return console.log("[stream] " + name + ": " + JSON.stringify(val));
    });
    return stream$;
};
proto.log = function (name) {
    return exports.log(name, this);
};
// ------------ Stream::map --------------
exports.map = function map(mapper, stream$) {
    return combine(mapper, [stream$]);
};
proto.map = function (mapper) {
    return exports.map(mapper, this);
};
// ------------ Stream::unique --------------
exports.unique = function unique(stream$) {
    var lastValue = stream$();
    var unique$ = exports.Stream(lastValue);
    exports.subscribe(stream$, function (val) {
        if (val !== lastValue) {
            unique$(val);
            lastValue = val;
        }
    });
    return unique$;
};
proto.unique = function () {
    return exports.unique(this);
};
// ------------ Stream::filter --------------
exports.filter = function filter(predict, stream$) {
    var init = stream$();
    var filtered$ = exports.Stream();
    stream$.subscribe(function (val) {
        if (predict(val)) {
            filtered$(val);
        }
    });
    return filtered$;
};
proto.filter = function (predict) {
    return exports.filter(predict, this);
};
// ------------ Stream::delay --------------
exports.delay = function delay(delayInMs, stream$) {
    var delayed$ = exports.Stream();
    exports.subscribe(stream$, function (value) {
        setTimeout(function () {
            delayed$(value);
        }, delayInMs);
    });
    return delayed$;
};
proto.delay = function (delayInMs) {
    return exports.delay(delayInMs, this);
};
function pipe(operators, stream$) {
    return operators.reduce(function (current$, operator) { return operator(current$); }, stream$);
}
exports.pipe = pipe;
// ------------ tests --------------
console.log('=========== stream tests ============');
// const a = Stream(1).log('a')
// const b = a.map(x => x * 2).log('b')
// const c = a.filter<number>(x => Boolean(x % 2)).log('c')
// const c = Stream.merge([a, b]).log('c')
// const d = Stream.combine((a, b) => a + b, [a, b]).log('d')
// const e = log('e', map(x => x * 3, d))
// const f = log('f', filter(x => Boolean(x % 2), e))
// const a = Stream(1).log('x111')
// const b = a.map(x => x * 2).log('x222')
// a(2)
// a(3)
console.log('=====================================');
