"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AddSubtract = __importStar(require("../features/add_subtract/epic"));
var MultiplyDivide = __importStar(require("../features/multiply_divide/epic"));
var stream_1 = require("../util/stream");
var epics = AddSubtract.epic.concat(MultiplyDivide.epic);
exports.rootEpic = function (action$, store) {
    return stream_1.Stream.merge(epics.map(function (epic) { return epic(action$, store); }));
};
