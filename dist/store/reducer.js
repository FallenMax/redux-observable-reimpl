"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AddSubtract = __importStar(require("../features/add_subtract/reducer"));
var MultiplyDivide = __importStar(require("../features/multiply_divide/reducer"));
exports.state = {
    addSubtract: AddSubtract.state,
    multiDivide: MultiplyDivide.state,
};
exports.reducers = {
    addSubtract: AddSubtract.reducer,
    multiDivide: MultiplyDivide.reducer,
};
