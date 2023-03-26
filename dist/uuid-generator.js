"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomUuid = void 0;
function randomUuid() {
    const S4 = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}
exports.randomUuid = randomUuid;
