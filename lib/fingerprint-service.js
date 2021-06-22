(function (){
    /*! *****************************************************************************
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
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf || {
            __proto__: []
        } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) {
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p];
            }
        };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = function () {
            if (b === null) {
                return Object.create(b);
            }
            return __.prototype = b.prototype, new __();
        }();
    }
    var __assign$1 = function () {
        __assign$1 = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) {
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                }
            }
            return t;
        };
        return __assign$1.apply(this, arguments);
    };
    function __awaiter$1(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return function () {
                if (value instanceof P) {
                    return value;
                }
                return new P(function (resolve) {
                    resolve(value);
                });
            }();
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                (function () {
                    if (result.done) {
                        return resolve(result.value);
                    }
                    return adopt(result.value).then(fulfilled, rejected);
                })();
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator$1(thisArg, body) {
        var _ = {
            label: 0,
            sent: function () {
                if (t[0] & 1)
                    throw t[1];
                return t[1];
            },
            trys: [],
            ops: []
        }, f, y, t, g;
        return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
        }), g;
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_) {
                try {
                    if (f = 1, y && (t = function () {
                        if (op[0] & 2) {
                            return y["return"];
                        }
                        return function () {
                            if (op[0]) {
                                return y["throw"] || ((t = y["return"]) && t.call(y), 0);
                            }
                            return y.next;
                        }();
                    }()) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            }
            if (op[0] & 5)
                throw op[1];
            return {
                value: function () {
                    if (op[0]) {
                        return op[1];
                    }
                    return void 0;
                }(),
                done: true
            };
        }
    }

    /*! *****************************************************************************
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
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) {
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                }
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return function () {
                if (value instanceof P) {
                    return value;
                }
                return new P(function (resolve) {
                    resolve(value);
                });
            }();
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                (function () {
                    if (result.done) {
                        return resolve(result.value);
                    }
                    return adopt(result.value).then(fulfilled, rejected);
                })();
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = {
            label: 0,
            sent: function () {
                if (t[0] & 1)
                    throw t[1];
                return t[1];
            },
            trys: [],
            ops: []
        }, f, y, t, g;
        return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
        }), g;
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_) {
                try {
                    if (f = 1, y && (t = function () {
                        if (op[0] & 2) {
                            return y["return"];
                        }
                        return function () {
                            if (op[0]) {
                                return y["throw"] || ((t = y["return"]) && t.call(y), 0);
                            }
                            return y.next;
                        }();
                    }()) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            }
            if (op[0] & 5)
                throw op[1];
            return {
                value: function () {
                    if (op[0]) {
                        return op[1];
                    }
                    return void 0;
                }(),
                done: true
            };
        }
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
            s += arguments[i].length;
        }
        for (var r = Array(s), k = 0, i = 0; i < il; i++) {
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
                r[k] = a[j];
            }
        }
        return r;
    }

    /**
     * FingerprintJS v3.1.2 - Copyright (c) FingerprintJS, Inc, 2021 (https://fingerprintjs.com)
     * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
     *
     * This software contains code from open-source projects:
     * MurmurHash3 by Karan Lyons (https://github.com/karanlyons/murmurHash3.js)
     */
    /*
 * Taken from https://github.com/karanlyons/murmurHash3.js/blob/a33d0723127e2e5415056c455f8aed2451ace208/murmurHash3.js
 */
//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// added together as a 64bit int (as an array of two 32bit ints).
//
    function x64Add(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] + n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] + n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] + n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] + n[0];
        o[0] &= 0xffff;
        return [o[0] << 16 | o[1], o[2] << 16 | o[3]];
    } //
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// multiplied together as a 64bit int (as an array of two 32bit ints).
//
    function x64Multiply(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] * n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] * n[3];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[2] += m[3] * n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] * n[3];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[2] * n[2];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[3] * n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
        o[0] &= 0xffff;
        return [o[0] << 16 | o[1], o[2] << 16 | o[3]];
    } //
// Given a 64bit int (as an array of two 32bit ints) and an int
// representing a number of bit positions, returns the 64bit int (as an
// array of two 32bit ints) rotated left by that number of positions.
//
    function x64Rotl(m, n) {
        n %= 64;
        if (n === 32) {
            return [m[1], m[0]];
        }
        else if (n < 32) {
            return [m[0] << n | m[1] >>> 32 - n, m[1] << n | m[0] >>> 32 - n];
        }
        else {
            n -= 32;
            return [m[1] << n | m[0] >>> 32 - n, m[0] << n | m[1] >>> 32 - n];
        }
    } //
// Given a 64bit int (as an array of two 32bit ints) and an int
// representing a number of bit positions, returns the 64bit int (as an
// array of two 32bit ints) shifted left by that number of positions.
//
    function x64LeftShift(m, n) {
        n %= 64;
        if (n === 0) {
            return m;
        }
        else if (n < 32) {
            return [m[0] << n | m[1] >>> 32 - n, m[1] << n];
        }
        else {
            return [m[1] << n - 32, 0];
        }
    } //
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// xored together as a 64bit int (as an array of two 32bit ints).
//
    function x64Xor(m, n) {
        return [m[0] ^ n[0], m[1] ^ n[1]];
    } //
// Given a block, returns murmurHash3's final x64 mix of that block.
// (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
// only place where we need to right shift 64bit ints.)
//
    function x64Fmix(h) {
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xff51afd7, 0xed558ccd]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        return h;
    } //
// Given a string and an optional seed as an int, returns a 128 bit
// hash using the x64 flavor of MurmurHash3, as an unsigned hex.
//
    function x64hash128(key, seed) {
        key = key || '';
        seed = seed || 0;
        var remainder = key.length % 16;
        var bytes = key.length - remainder;
        var h1 = [0, seed];
        var h2 = [0, seed];
        var k1 = [0, 0];
        var k2 = [0, 0];
        var c1 = [0x87c37b91, 0x114253d5];
        var c2 = [0x4cf5ad43, 0x2745937f];
        var i;
        for (i = 0; i < bytes; i = i + 16) {
            k1 = [key.charCodeAt(i + 4) & 0xff | (key.charCodeAt(i + 5) & 0xff) << 8 | (key.charCodeAt(i + 6) & 0xff) << 16 | (key.charCodeAt(i + 7) & 0xff) << 24, key.charCodeAt(i) & 0xff | (key.charCodeAt(i + 1) & 0xff) << 8 | (key.charCodeAt(i + 2) & 0xff) << 16 | (key.charCodeAt(i + 3) & 0xff) << 24];
            k2 = [key.charCodeAt(i + 12) & 0xff | (key.charCodeAt(i + 13) & 0xff) << 8 | (key.charCodeAt(i + 14) & 0xff) << 16 | (key.charCodeAt(i + 15) & 0xff) << 24, key.charCodeAt(i + 8) & 0xff | (key.charCodeAt(i + 9) & 0xff) << 8 | (key.charCodeAt(i + 10) & 0xff) << 16 | (key.charCodeAt(i + 11) & 0xff) << 24];
            k1 = x64Multiply(k1, c1);
            k1 = x64Rotl(k1, 31);
            k1 = x64Multiply(k1, c2);
            h1 = x64Xor(h1, k1);
            h1 = x64Rotl(h1, 27);
            h1 = x64Add(h1, h2);
            h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
            k2 = x64Multiply(k2, c2);
            k2 = x64Rotl(k2, 33);
            k2 = x64Multiply(k2, c1);
            h2 = x64Xor(h2, k2);
            h2 = x64Rotl(h2, 31);
            h2 = x64Add(h2, h1);
            h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
        }
        k1 = [0, 0];
        k2 = [0, 0];
        switch (remainder) {
            case 15:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48));
            // fallthrough
            case 14:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40));
            // fallthrough
            case 13:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32));
            // fallthrough
            case 12:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24));
            // fallthrough
            case 11:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16));
            // fallthrough
            case 10:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8));
            // fallthrough
            case 9:
                k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)]);
                k2 = x64Multiply(k2, c2);
                k2 = x64Rotl(k2, 33);
                k2 = x64Multiply(k2, c1);
                h2 = x64Xor(h2, k2);
            // fallthrough
            case 8:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56));
            // fallthrough
            case 7:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48));
            // fallthrough
            case 6:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40));
            // fallthrough
            case 5:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32));
            // fallthrough
            case 4:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24));
            // fallthrough
            case 3:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16));
            // fallthrough
            case 2:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8));
            // fallthrough
            case 1:
                k1 = x64Xor(k1, [0, key.charCodeAt(i)]);
                k1 = x64Multiply(k1, c1);
                k1 = x64Rotl(k1, 31);
                k1 = x64Multiply(k1, c2);
                h1 = x64Xor(h1, k1);
            // fallthrough
        }
        h1 = x64Xor(h1, [0, key.length]);
        h2 = x64Xor(h2, [0, key.length]);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        h1 = x64Fmix(h1);
        h2 = x64Fmix(h2);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        return ('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) + ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) + ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) + ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8);
    }
    var version = "3.1.2";
    function wait(durationMs, resolveWith) {
        return new Promise(function (resolve) {
            return setTimeout(resolve, durationMs, resolveWith);
        });
    }
    function requestIdleCallbackIfAvailable(fallbackTimeout, deadlineTimeout) {
        if (deadlineTimeout === void 0) {
            deadlineTimeout = Infinity;
        }
        var requestIdleCallback = window.requestIdleCallback;
        if (requestIdleCallback) {
            return new Promise(function (resolve) {
                return requestIdleCallback(function () {
                    return resolve();
                }, {
                    timeout: deadlineTimeout
                });
            });
        }
        else {
            return wait(Math.min(fallbackTimeout, deadlineTimeout));
        }
    }
    /**
     * Converts an error object to a plain object that can be used with `JSON.stringify`.
     * If you just run `JSON.stringify(error)`, you'll get `'{}'`.
     */
    function errorToObject(error) {
        var _a;
        return __assign({
            name: error.name,
            message: error.message,
            stack: function () {
                if ((_a = error.stack) === null || _a === void 0) {
                    return void 0;
                }
                return _a.split('\n');
            }()
        }, error);
    }
    /*
 * This file contains functions to work with pure data only (no browser features, DOM, side effects, etc).
 */
    /**
     * Does the same as Array.prototype.includes but has better typing
     */
    function includes(haystack, needle) {
        for (var i = 0, l = haystack.length; i < l; ++i) {
            if (haystack[i] === needle) {
                return true;
            }
        }
        return false;
    }
    /**
     * Like `!includes()` but with proper typing
     */
    function excludes(haystack, needle) {
        return !includes(haystack, needle);
    }
    /**
     * Be careful, NaN can return
     */
    function toInt(value) {
        return parseInt(value);
    }
    /**
     * Be careful, NaN can return
     */
    function toFloat(value) {
        return parseFloat(value);
    }
    function replaceNaN(value, replacement) {
        return function () {
            if (typeof value === 'number' && isNaN(value)) {
                return replacement;
            }
            return value;
        }();
    }
    function countTruthy(values) {
        return values.reduce(function (sum, value) {
            return sum + function () {
                if (value) {
                    return 1;
                }
                return 0;
            }();
        }, 0);
    }
    function round(value, base) {
        if (base === void 0) {
            base = 1;
        }
        if (Math.abs(base) >= 1) {
            return Math.round(value / base) * base;
        }
        else {
            // Sometimes when a number is multiplied by a small number, precision is lost,
            // for example 1234 * 0.0001 === 0.12340000000000001, and it's more precise divide: 1234 / (1 / 0.0001) === 0.1234.
            var counterBase = 1 / base;
            return Math.round(value * counterBase) / counterBase;
        }
    }
    /**
     * Parses a CSS selector into tag name with HTML attributes.
     * Only single element selector are supported (without operators like space, +, >, etc).
     *
     * Multiple values can be returned for each attribute. You decide how to handle them.
     */
    function parseSimpleCssSelector(selector) {
        var _a, _b;
        var errorMessage = "Unexpected syntax '" + selector + "'";
        var tagMatch = /^\s*([a-z-]*)(.*)$/i.exec(selector);
        var tag = tagMatch[1] || undefined;
        var attributes = {};
        var partsRegex = /([.:#][\w-]+|\[.+?\])/gi;
        var addAttribute = function (name, value) {
            attributes[name] = attributes[name] || [];
            attributes[name].push(value);
        };
        for (;;) {
            var match = partsRegex.exec(tagMatch[2]);
            if (!match) {
                break;
            }
            var part = match[0];
            switch (part[0]) {
                case '.':
                    addAttribute('class', part.slice(1));
                    break;
                case '#':
                    addAttribute('id', part.slice(1));
                    break;
                case '[':
                {
                    var attributeMatch = /^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(part);
                    if (attributeMatch) {
                        addAttribute(attributeMatch[1], function () {
                            if ((_b = function () {
                                if ((_a = attributeMatch[4]) !== null && _a !== void 0) {
                                    return _a;
                                }
                                return attributeMatch[5];
                            }()) !== null && _b !== void 0) {
                                return _b;
                            }
                            return '';
                        }());
                    }
                    else {
                        throw new Error(errorMessage);
                    }
                    break;
                }
                default:
                    throw new Error(errorMessage);
            }
        }
        return [tag, attributes];
    }
    /*
 * Functions to help with features that vary through browsers
 */
    /**
     * Checks whether the browser is based on Trident (the Internet Explorer engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isTrident() {
        var w = window;
        var n = navigator; // The properties are checked to be in IE 10, IE 11 and not to be in other browsers in October 2020
        return countTruthy(['MSCSSMatrix' in w, 'msSetImmediate' in w, 'msIndexedDB' in w, 'msMaxTouchPoints' in n, 'msPointerEnabled' in n]) >= 4;
    }
    /**
     * Checks whether the browser is based on EdgeHTML (the pre-Chromium Edge engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isEdgeHTML() {
        // Based on research in October 2020
        var w = window;
        var n = navigator;
        return countTruthy(['msWriteProfilerMark' in w, 'MSStream' in w, 'msLaunchUri' in n, 'msSaveBlob' in n]) >= 3 && !isTrident();
    }
    /**
     * Checks whether the browser is based on Chromium without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isChromium() {
        // Based on research in October 2020. Tested to detect Chromium 42-86.
        var w = window;
        var n = navigator;
        return countTruthy(['webkitPersistentStorage' in n, 'webkitTemporaryStorage' in n, n.vendor.indexOf('Google') === 0, 'webkitResolveLocalFileSystemURL' in w, 'BatteryManager' in w, 'webkitMediaStream' in w, 'webkitSpeechGrammar' in w]) >= 5;
    }
    /**
     * Checks whether the browser is based on mobile or desktop Safari without using user-agent.
     * All iOS browsers use WebKit (the Safari engine).
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isWebKit() {
        // Based on research in September 2020
        var w = window;
        var n = navigator;
        return countTruthy(['ApplePayError' in w, 'CSSPrimitiveValue' in w, 'Counter' in w, n.vendor.indexOf('Apple') === 0, 'getStorageUpdates' in n, 'WebKitMediaKeys' in w]) >= 4;
    }
    /**
     * Checks whether the WebKit browser is a desktop Safari.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isDesktopSafari() {
        var w = window;
        return countTruthy(['safari' in w, !('DeviceMotionEvent' in w), !('ongestureend' in w), !('standalone' in navigator)]) >= 3;
    }
    /**
     * Checks whether the browser is based on Gecko (Firefox engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isGecko() {
        var _a, _b;
        var w = window; // Based on research in September 2020
        return countTruthy(['buildID' in navigator, 'MozAppearance' in function () {
            if ((_b = function () {
                if ((_a = document.documentElement) === null || _a === void 0) {
                    return void 0;
                }
                return _a.style;
            }()) !== null && _b !== void 0) {
                return _b;
            }
            return {};
        }(), 'MediaRecorderErrorEvent' in w, 'mozInnerScreenX' in w, 'CSSMozDocumentRule' in w, 'CanvasCaptureMediaStream' in w]) >= 4;
    }
    /**
     * Checks whether the browser is based on Chromium version ≥86 without using user-agent.
     * It doesn't check that the browser is based on Chromium, there is a separate function for this.
     */
    function isChromium86OrNewer() {
        // Checked in Chrome 85 vs Chrome 86 both on desktop and Android
        var w = window;
        return countTruthy([!('MediaSettingsRange' in w), 'RTCEncodedAudioFrame' in w, '' + w.Intl === '[object Intl]', '' + w.Reflect === '[object Reflect]']) >= 3;
    }
    /**
     * Checks whether the browser is based on WebKit version ≥606 (Safari ≥12) without using user-agent.
     * It doesn't check that the browser is based on WebKit, there is a separate function for this.
     *
     * @link https://en.wikipedia.org/wiki/Safari_version_history#Release_history Safari-WebKit versions map
     */
    function isWebKit606OrNewer() {
        // Checked in Safari 9–14
        var w = window;
        return countTruthy(['DOMRectList' in w, 'RTCPeerConnectionIceEvent' in w, 'SVGGeometryElement' in w, 'ontransitioncancel' in w]) >= 3;
    }
    /**
     * Checks whether the device is an iPad.
     * It doesn't check that the engine is WebKit and that the WebKit isn't desktop.
     */
    function isIPad() {
        // Checked on:
        // Safari on iPadOS (both mobile and desktop modes): 8, 11, 12, 13, 14
        // Chrome on iPadOS (both mobile and desktop modes): 11, 12, 13, 14
        // Safari on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
        // Chrome on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
        // Before iOS 13. Safari tampers the value in "request desktop site" mode since iOS 13.
        if (navigator.platform === 'iPad') {
            return true;
        }
        var s = screen;
        var screenRatio = s.width / s.height;
        return countTruthy(['MediaSource' in window, !!Element.prototype.webkitRequestFullscreen, screenRatio > 2 / 3 && screenRatio < 3 / 2]) >= 2;
    }
    /**
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function getFullscreenElement() {
        var d = document;
        return d.fullscreenElement || d.msFullscreenElement || d.mozFullScreenElement || d.webkitFullscreenElement || null;
    }
    function exitFullscreen() {
        var d = document; // `call` is required because the function throws an error without a proper "this" context
        return (d.exitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen).call(d);
    }
    /**
     * Checks whether the device runs on Android without using user-agent.
     */
    function isAndroid() {
        var isItChromium = isChromium();
        var isItGecko = isGecko(); // Only 2 browser engines are presented on Android.
        // Actually, there is also Android 4.1 browser, but it's not worth detecting it at the moment.
        if (!isItChromium && !isItGecko) {
            return false;
        }
        var w = window; // Chrome removes all words "Android" from `navigator` when desktop version is requested
        // Firefox keeps "Android" in `navigator.appVersion` when desktop version is requested
        return countTruthy(['onorientationchange' in w, 'orientation' in w, isItChromium && 'SharedWorker' in w, isItGecko && /android/i.test(navigator.appVersion)]) >= 2;
    }
    /**
     * A deep description: https://fingerprintjs.com/blog/audio-fingerprinting/
     * Inspired by and based on https://github.com/cozylife/audio-fingerprint
     */
    function getAudioFingerprint() {
        return __awaiter(this, void 0, void 0, function () {
            var w, AudioContext, hashFromIndex, hashToIndex, context, oscillator, compressor, buffer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        w = window;
                        AudioContext = w.OfflineAudioContext || w.webkitOfflineAudioContext;
                        if (!AudioContext) {
                            return [2
                                /*return*/
                                ,
                                -2
                                /* NotSupported */
                            ];
                        } // In some browsers, audio context always stays suspended unless the context is started in response to a user action
                        // (e.g. a click or a tap). It prevents audio fingerprint from being taken at an arbitrary moment of time.
                        // Such browsers are old and unpopular, so the audio fingerprinting is just skipped in them.
                        // See a similar case explanation at https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
                        if (doesCurrentBrowserSuspendAudioContext()) {
                            return [2
                                /*return*/
                                ,
                                -1
                                /* KnownToSuspend */
                            ];
                        }
                        hashFromIndex = 4500;
                        hashToIndex = 5000;
                        context = new AudioContext(1, hashToIndex, 44100);
                        oscillator = context.createOscillator();
                        oscillator.type = 'triangle';
                        oscillator.frequency.value = 10000;
                        compressor = context.createDynamicsCompressor();
                        compressor.threshold.value = -50;
                        compressor.knee.value = 40;
                        compressor.ratio.value = 12;
                        compressor.attack.value = 0;
                        compressor.release.value = 0.25;
                        oscillator.connect(compressor);
                        compressor.connect(context.destination);
                        oscillator.start(0);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4
                            /*yield*/
                            ,
                            renderAudio(context)];
                    case 2:
                        buffer = _a.sent();
                        return [3
                            /*break*/
                            ,
                            4];
                    case 3:
                        error_1 = _a.sent();
                        if (error_1.name === "timeout"
                            /* Timeout */
                            || error_1.name === "suspended"
                            /* Suspended */
                        ) {
                            return [2
                                /*return*/
                                ,
                                -3
                                /* Timeout */
                            ];
                        }
                        throw error_1;
                    case 4:
                        return [2
                            /*return*/
                            ,
                            getHash(buffer.getChannelData(0).subarray(hashFromIndex))];
                }
            });
        });
    }
    /**
     * Checks if the current browser is known to always suspend audio context
     */
    function doesCurrentBrowserSuspendAudioContext() {
        return isWebKit() && !isDesktopSafari() && !isWebKit606OrNewer();
    }
    function renderAudio(context) {
        var resumeTriesMaxCount = 3;
        var resumeRetryDelay = 500;
        var runningTimeout = 1000;
        return new Promise(function (resolve, reject) {
            context.oncomplete = function (event) {
                return resolve(event.renderedBuffer);
            };
            var resumeTriesLeft = resumeTriesMaxCount;
            var tryResume = function () {
                context.startRendering();
                switch (context.state) {
                    case 'running':
                        setTimeout(function () {
                            return reject(makeInnerError("timeout"
                                /* Timeout */
                            ));
                        }, runningTimeout);
                        break;
                    // Sometimes the audio context doesn't start after calling `startRendering` (in addition to the cases where
                    // audio context doesn't start at all). A known case is starting an audio context when the browser tab is in
                    // background on iPhone. Retries usually help in this case.
                    case 'suspended':
                        // The audio context can reject starting until the tab is in foreground. Long fingerprint duration
                        // in background isn't a problem, therefore the retry attempts don't count in background. It can lead to
                        // a situation when a fingerprint takes very long time and finishes successfully. FYI, the audio context
                        // can be suspended when `document.hidden === false` and start running after a retry.
                        if (!document.hidden) {
                            resumeTriesLeft--;
                        }
                        if (resumeTriesLeft > 0) {
                            setTimeout(tryResume, resumeRetryDelay);
                        }
                        else {
                            reject(makeInnerError("suspended"
                                /* Suspended */
                            ));
                        }
                        break;
                }
            };
            tryResume();
        });
    }
    function getHash(signal) {
        var hash = 0;
        for (var i = 0; i < signal.length; ++i) {
            hash += Math.abs(signal[i]);
        }
        return hash;
    }
    function makeInnerError(name) {
        var error = new Error(name);
        error.name = name;
        return error;
    }
    /**
     * Creates and keeps an invisible iframe while the given function runs.
     * The given function is called when the iframe is loaded and has a body.
     * The iframe allows to measure DOM sizes inside itself.
     *
     * Notice: passing an initial HTML code doesn't work in IE.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function withIframe(action, initialHtml, domPollInterval) {
        var _a, _b;
        if (domPollInterval === void 0) {
            domPollInterval = 50;
        }
        return __awaiter(this, void 0, void 0, function () {
            var d, iframe;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        d = document;
                        _c.label = 1;
                    case 1:
                        if (!!d.body)
                            return [3
                                /*break*/
                                ,
                                3];
                        return [4
                            /*yield*/
                            ,
                            wait(domPollInterval)];
                    case 2:
                        _c.sent();
                        return [3
                            /*break*/
                            ,
                            1];
                    case 3:
                        iframe = d.createElement('iframe');
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, , 10, 11]);
                        return [4
                            /*yield*/
                            ,
                            new Promise(function (resolve, reject) {
                                iframe.onload = resolve;
                                iframe.onerror = reject;
                                var style = iframe.style;
                                style.setProperty('display', 'block', 'important'); // Required for browsers to calculate the layout
                                style.position = 'absolute';
                                style.top = '0';
                                style.left = '0';
                                style.visibility = 'hidden';
                                d.body.appendChild(iframe); // The order is important here.
                                // The `iframe.srcdoc = ...` expression must go after the `body.appendChild(iframe)` expression,
                                // otherwise the iframe will never load nor fail in WeChat built-in browser.
                                // See https://github.com/fingerprintjs/fingerprintjs/issues/645#issuecomment-828189330
                                if (initialHtml && 'srcdoc' in iframe) {
                                    iframe.srcdoc = initialHtml;
                                }
                                else {
                                    iframe.src = 'about:blank';
                                }
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!!function () {
                            if ((_a = iframe.contentWindow) === null || _a === void 0) {
                                return void 0;
                            }
                            return _a.document.body;
                        }())
                            return [3
                                /*break*/
                                ,
                                8];
                        return [4
                            /*yield*/
                            ,
                            wait(domPollInterval)];
                    case 7:
                        _c.sent();
                        return [3
                            /*break*/
                            ,
                            6];
                    case 8:
                        return [4
                            /*yield*/
                            ,
                            action(iframe, iframe.contentWindow)];
                    case 9:
                        return [2
                            /*return*/
                            ,
                            _c.sent()];
                    case 10:
                        (function () {
                            if ((_b = iframe.parentNode) === null || _b === void 0) {
                                return void 0;
                            }
                            return _b.removeChild(iframe);
                        })();
                        return [7
                            /*endfinally*/
                        ];
                    case 11:
                        return [2
                            /*return*/
                        ];
                }
            });
        });
    }
    /**
     * Creates a DOM element that matches the given selector.
     * Only single element selector are supported (without operators like space, +, >, etc).
     */
    function selectorToElement(selector) {
        var _a = parseSimpleCssSelector(selector), tag = _a[0], attributes = _a[1];
        var element = document.createElement(function () {
            if (tag !== null && tag !== void 0) {
                return tag;
            }
            return 'div';
        }());
        for (var _i = 0, _b = Object.keys(attributes); _i < _b.length; _i++) {
            var name_1 = _b[_i];
            element.setAttribute(name_1, attributes[name_1].join(' '));
        }
        return element;
    } // We use m or w because these two characters take up the maximum width.
// And we use a LLi so that the same matching fonts can get separated.
    var testString = 'mmMwWLliI0O&1'; // We test using 48px font size, we may use any size. I guess larger the better.
    var textSize = '48px'; // A font will be compared against all the three default fonts.
// And if it doesn't match all 3 then that font is not available.
    var baseFonts = ['monospace', 'sans-serif', 'serif'];
    var fontList = [
        'sans-serif-thin', 'ARNO PRO', 'Agency FB', 'Arabic Typesetting', 'Arial Unicode MS', 'AvantGarde Bk BT', 'BankGothic Md BT', 'Batang', 'Bitstream Vera Sans Mono', 'Calibri', 'Century', 'Century Gothic', 'Clarendon', 'EUROSTILE', 'Franklin Gothic', 'Futura Bk BT', 'Futura Md BT', 'GOTHAM', 'Gill Sans', 'HELV', 'Haettenschweiler', 'Helvetica Neue', 'Humanst521 BT', 'Leelawadee', 'Letter Gothic', 'Levenim MT', 'Lucida Bright', 'Lucida Sans', 'Menlo', 'MS Mincho', 'MS Outlook', 'MS Reference Specialty', 'MS UI Gothic', 'MT Extra', 'MYRIAD PRO', 'Marlett', 'Meiryo UI', 'Microsoft Uighur', 'Minion Pro', 'Monotype Corsiva', 'PMingLiU', 'Pristina', 'SCRIPTINA', 'Segoe UI Light', 'Serifa', 'SimHei', 'Small Fonts', 'Staccato222 BT', 'TRAJAN PRO', 'Univers CE 55 Medium', 'Vrinda', 'ZWAdobeF'
    ]; // kudos to http://www.lalit.org/lab/javascript-css-font-detect/
    function getFonts() {
        // Running the script in an iframe makes it not affect the page look and not be affected by the page CSS. See:
        // https://github.com/fingerprintjs/fingerprintjs/issues/592
        // https://github.com/fingerprintjs/fingerprintjs/issues/628
        return withIframe(function (_, _a) {
            var document = _a.document;
            var holder = document.body;
            holder.style.fontSize = textSize; // div to load spans for the default fonts and the fonts to detect
            var spansContainer = document.createElement('div');
            var defaultWidth = {};
            var defaultHeight = {}; // creates a span where the fonts will be loaded
            var createSpan = function (fontFamily) {
                var span = document.createElement('span');
                var style = span.style;
                style.position = 'absolute';
                style.top = '0';
                style.left = '0';
                style.fontFamily = fontFamily;
                span.textContent = testString;
                spansContainer.appendChild(span);
                return span;
            }; // creates a span and load the font to detect and a base font for fallback
            var createSpanWithFonts = function (fontToDetect, baseFont) {
                return createSpan("'" + fontToDetect + "'," + baseFont);
            }; // creates spans for the base fonts and adds them to baseFontsDiv
            var initializeBaseFontsSpans = function () {
                return baseFonts.map(createSpan);
            }; // creates spans for the fonts to detect and adds them to fontsDiv
            var initializeFontsSpans = function () {
                // Stores {fontName : [spans for that font]}
                var spans = {};
                var _loop_1 = function (font) {
                    spans[font] = baseFonts.map(function (baseFont) {
                        return createSpanWithFonts(font, baseFont);
                    });
                };
                for (var _i = 0, fontList_1 = fontList; _i < fontList_1.length; _i++) {
                    var font = fontList_1[_i];
                    _loop_1(font);
                }
                return spans;
            }; // checks if a font is available
            var isFontAvailable = function (fontSpans) {
                return baseFonts.some(function (baseFont, baseFontIndex) {
                    return fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] || fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont];
                });
            }; // create spans for base fonts
            var baseFontsSpans = initializeBaseFontsSpans(); // create spans for fonts to detect
            var fontsSpans = initializeFontsSpans(); // add all the spans to the DOM
            holder.appendChild(spansContainer); // get the default width for the three base fonts
            for (var index = 0; index < baseFonts.length; index++) {
                defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
                defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
            } // check available fonts
            return fontList.filter(function (font) {
                return isFontAvailable(fontsSpans[font]);
            });
        });
    }
    function getPlugins() {
        var rawPlugins = navigator.plugins;
        if (!rawPlugins) {
            return undefined;
        }
        var plugins = []; // Safari 10 doesn't support iterating navigator.plugins with for...of
        for (var i = 0; i < rawPlugins.length; ++i) {
            var plugin = rawPlugins[i];
            if (!plugin) {
                continue;
            }
            var mimeTypes = [];
            for (var j = 0; j < plugin.length; ++j) {
                var mimeType = plugin[j];
                mimeTypes.push({
                    type: mimeType.type,
                    suffixes: mimeType.suffixes
                });
            }
            plugins.push({
                name: plugin.name,
                description: plugin.description,
                mimeTypes: mimeTypes
            });
        }
        return plugins;
    } // https://www.browserleaks.com/canvas#how-does-it-work
    function getCanvasFingerprint() {
        var _a = makeCanvasContext(), canvas = _a[0], context = _a[1];
        if (!isSupported(canvas, context)) {
            return {
                winding: false,
                geometry: '',
                text: ''
            };
        }
        return {
            winding: doesSupportWinding(context),
            geometry: makeGeometryImage(canvas, context),
            // Text is unstable:
            // https://github.com/fingerprintjs/fingerprintjs/issues/583
            // https://github.com/fingerprintjs/fingerprintjs/issues/103
            // Therefore it's extracted into a separate image.
            text: makeTextImage(canvas, context)
        };
    }
    function makeCanvasContext() {
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return [canvas, canvas.getContext('2d')];
    }
    function isSupported(canvas, context) {
        // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
        return !!(context && canvas.toDataURL);
    }
    function doesSupportWinding(context) {
        // https://web.archive.org/web/20170825024655/http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
        context.rect(0, 0, 10, 10);
        context.rect(2, 2, 6, 6);
        return !context.isPointInPath(5, 5, 'evenodd');
    }
    function makeTextImage(canvas, context) {
        // Resizing the canvas cleans it
        canvas.width = 240;
        canvas.height = 60;
        context.textBaseline = 'alphabetic';
        context.fillStyle = '#f60';
        context.fillRect(100, 1, 62, 20);
        context.fillStyle = '#069'; // It's important to use explicit built-in fonts in order to exclude the affect of font preferences
        // (there is a separate entropy source for them).
        context.font = '11pt "Times New Roman"'; // The choice of emojis has a gigantic impact on rendering performance (especially in FF).
        // Some newer emojis cause it to slow down 50-200 times.
        // There must be no text to the right of the emoji, see https://github.com/fingerprintjs/fingerprintjs/issues/574
        // A bare emoji shouldn't be used because the canvas will change depending on the script encoding:
        // https://github.com/fingerprintjs/fingerprintjs/issues/66
        // Escape sequence shouldn't be used too because Terser will turn it into a bare unicode.
        var printedText = "Cwm fjordbank gly " + String.fromCharCode(55357, 56835);
        context.fillText(printedText, 2, 15);
        context.fillStyle = 'rgba(102, 204, 0, 0.2)';
        context.font = '18pt Arial';
        context.fillText(printedText, 4, 45);
        return save(canvas);
    }
    function makeGeometryImage(canvas, context) {
        // Resizing the canvas cleans it
        canvas.width = 122;
        canvas.height = 110; // Canvas blending
        // https://web.archive.org/web/20170826194121/http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // http://jsfiddle.net/NDYV8/16/
        context.globalCompositeOperation = 'multiply';
        for (var _i = 0, _a = [['#f2f', 40, 40], ['#2ff', 80, 40], ['#ff2', 60, 80]]; _i < _a.length; _i++) {
            var _b = _a[_i], color = _b[0], x = _b[1], y = _b[2];
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, 40, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        } // Canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // http://jsfiddle.net/NDYV8/19/
        context.fillStyle = '#f9c';
        context.arc(60, 60, 60, 0, Math.PI * 2, true);
        context.arc(60, 60, 20, 0, Math.PI * 2, true);
        context.fill('evenodd');
        return save(canvas);
    }
    function save(canvas) {
        // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
        return canvas.toDataURL();
    }
    /**
     * This is a crude and primitive touch screen detection. It's not possible to currently reliably detect the availability
     * of a touch screen with a JS, without actually subscribing to a touch event.
     *
     * @see http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
     * @see https://github.com/Modernizr/Modernizr/issues/548
     */
    function getTouchSupport() {
        var n = navigator;
        var maxTouchPoints = 0;
        var touchEvent;
        if (n.maxTouchPoints !== undefined) {
            maxTouchPoints = toInt(n.maxTouchPoints);
        }
        else if (n.msMaxTouchPoints !== undefined) {
            maxTouchPoints = n.msMaxTouchPoints;
        }
        try {
            document.createEvent('TouchEvent');
            touchEvent = true;
        }
        catch (_) {
            touchEvent = false;
        }
        var touchStart = ('ontouchstart' in window);
        return {
            maxTouchPoints: maxTouchPoints,
            touchEvent: touchEvent,
            touchStart: touchStart
        };
    }
    function getOsCpu() {
        return navigator.oscpu;
    }
    function getLanguages() {
        var n = navigator;
        var result = [];
        var language = n.language || n.userLanguage || n.browserLanguage || n.systemLanguage;
        if (language !== undefined) {
            result.push([language]);
        }
        if (Array.isArray(n.languages)) {
            // Starting from Chromium 86, there is only a single value in `navigator.language` in Incognito mode:
            // the value of `navigator.language`. Therefore the value is ignored in this browser.
            if (!(isChromium() && isChromium86OrNewer())) {
                result.push(n.languages);
            }
        }
        else if (typeof n.languages === 'string') {
            var languages = n.languages;
            if (languages) {
                result.push(languages.split(','));
            }
        }
        return result;
    }
    function getColorDepth() {
        return window.screen.colorDepth;
    }
    function getDeviceMemory() {
        // `navigator.deviceMemory` is a string containing a number in some unidentified cases
        return replaceNaN(toFloat(navigator.deviceMemory), undefined);
    }
    function getScreenResolution() {
        var s = screen; // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
        // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
        var dimensions = [toInt(s.width), toInt(s.height)];
        dimensions.sort().reverse();
        return dimensions;
    }
    var screenFrameCheckInterval = 2500;
    var roundingPrecision = 10; // The type is readonly to protect from unwanted mutations
    var screenFrameBackup;
    var screenFrameSizeTimeoutId;
    /**
     * Starts watching the screen frame size. When a non-zero size appears, the size is saved and the watch is stopped.
     * Later, when `getScreenFrame` is called, it will return the saved non-zero size if the current size is null.
     *
     * This trick is required to mitigate the fact that the screen frame turns null in some cases.
     * See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
     */
    function watchScreenFrame() {
        if (screenFrameSizeTimeoutId !== undefined) {
            return;
        }
        var checkScreenFrame = function () {
            var frameSize = getCurrentScreenFrame();
            if (isFrameSizeNull(frameSize)) {
                screenFrameSizeTimeoutId = setTimeout(checkScreenFrame, screenFrameCheckInterval);
            }
            else {
                screenFrameBackup = frameSize;
                screenFrameSizeTimeoutId = undefined;
            }
        };
        checkScreenFrame();
    }
    function getScreenFrame() {
        return __awaiter(this, void 0, void 0, function () {
            var frameSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        frameSize = getCurrentScreenFrame();
                        if (!isFrameSizeNull(frameSize))
                            return [3
                                /*break*/
                                ,
                                2];
                        if (screenFrameBackup) {
                            return [2
                                /*return*/
                                ,
                                __spreadArrays(screenFrameBackup)];
                        }
                        if (!getFullscreenElement())
                            return [3
                                /*break*/
                                ,
                                2]; // Some browsers set the screen frame to zero when programmatic fullscreen is on.
                        // There is a chance of getting a non-zero frame after exiting the fullscreen.
                        // See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
                        return [4
                            /*yield*/
                            ,
                            exitFullscreen()];
                    case 1:
                        // Some browsers set the screen frame to zero when programmatic fullscreen is on.
                        // There is a chance of getting a non-zero frame after exiting the fullscreen.
                        // See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
                        _a.sent();
                        frameSize = getCurrentScreenFrame();
                        _a.label = 2;
                    case 2:
                        if (!isFrameSizeNull(frameSize)) {
                            screenFrameBackup = frameSize;
                        }
                        return [2
                            /*return*/
                            ,
                            frameSize];
                }
            });
        });
    }
    /**
     * Sometimes the available screen resolution changes a bit, e.g. 1900x1440 → 1900x1439. A possible reason: macOS Dock
     * shrinks to fit more icons when there is too little space. The rounding is used to mitigate the difference.
     */
    function getRoundedScreenFrame() {
        return __awaiter(this, void 0, void 0, function () {
            var processSize, frameSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        processSize = function (sideSize) {
                            return function () {
                                if (sideSize === null) {
                                    return null;
                                }
                                return round(sideSize, roundingPrecision);
                            }();
                        };
                        return [4
                            /*yield*/
                            ,
                            getScreenFrame() // It might look like I don't know about `for` and `map`.
                            // In fact, such code is used to avoid TypeScript issues without using `as`.
                        ];
                    case 1:
                        frameSize = _a.sent(); // It might look like I don't know about `for` and `map`.
                        // In fact, such code is used to avoid TypeScript issues without using `as`.
                        return [2
                            /*return*/
                            ,
                            [processSize(frameSize[0]), processSize(frameSize[1]), processSize(frameSize[2]), processSize(frameSize[3])]];
                }
            });
        });
    }
    function getCurrentScreenFrame() {
        var s = screen; // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
        // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
        //
        // Some browsers (IE, Edge ≤18) don't provide `screen.availLeft` and `screen.availTop`. The property values are
        // replaced with 0 in such cases to not lose the entropy from `screen.availWidth` and `screen.availHeight`.
        return [replaceNaN(toFloat(s.availTop), null), replaceNaN(toFloat(s.width) - toFloat(s.availWidth) - replaceNaN(toFloat(s.availLeft), 0), null), replaceNaN(toFloat(s.height) - toFloat(s.availHeight) - replaceNaN(toFloat(s.availTop), 0), null), replaceNaN(toFloat(s.availLeft), null)];
    }
    function isFrameSizeNull(frameSize) {
        for (var i = 0; i < 4; ++i) {
            if (frameSize[i]) {
                return false;
            }
        }
        return true;
    }
    function getHardwareConcurrency() {
        // sometimes hardware concurrency is a string
        return replaceNaN(toInt(navigator.hardwareConcurrency), undefined);
    }
    function getTimezone() {
        var _a;
        var DateTimeFormat = function () {
            if ((_a = window.Intl) === null || _a === void 0) {
                return void 0;
            }
            return _a.DateTimeFormat;
        }();
        if (DateTimeFormat) {
            var timezone = new DateTimeFormat().resolvedOptions().timeZone;
            if (timezone) {
                return timezone;
            }
        } // For browsers that don't support timezone names
        // The minus is intentional because the JS offset is opposite to the real offset
        var offset = -getTimezoneOffset();
        return "UTC" + function () {
            if (offset >= 0) {
                return '+';
            }
            return '';
        }() + Math.abs(offset);
    }
    function getTimezoneOffset() {
        var currentYear = new Date().getFullYear(); // The timezone offset may change over time due to daylight saving time (DST) shifts.
        // The non-DST timezone offset is used as the result timezone offset.
        // Since the DST season differs in the northern and the southern hemispheres,
        // both January and July timezones offsets are considered.
        return Math.max(// `getTimezoneOffset` returns a number as a string in some unidentified cases
            toFloat(new Date(currentYear, 0, 1).getTimezoneOffset()), toFloat(new Date(currentYear, 6, 1).getTimezoneOffset()));
    }
    function getSessionStorage() {
        try {
            return !!window.sessionStorage;
        }
        catch (error) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    } // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    function getLocalStorage() {
        try {
            return !!window.localStorage;
        }
        catch (e) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }
    function getIndexedDB() {
        // IE and Edge don't allow accessing indexedDB in private mode, therefore IE and Edge will have different
        // visitor identifier in normal and private modes.
        if (isTrident() || isEdgeHTML()) {
            return undefined;
        }
        try {
            return !!window.indexedDB;
        }
        catch (e) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }
    function getOpenDatabase() {
        return !!window.openDatabase;
    }
    function getCpuClass() {
        return navigator.cpuClass;
    }
    function getPlatform() {
        // Android Chrome 86 and 87 and Android Firefox 80 and 84 don't mock the platform value when desktop mode is requested
        var platform = navigator.platform; // iOS mocks the platform value when desktop version is requested: https://github.com/fingerprintjs/fingerprintjs/issues/514
        // iPad uses desktop mode by default since iOS 13
        // The value is 'MacIntel' on M1 Macs
        // The value is 'iPhone' on iPod Touch
        if (platform === 'MacIntel') {
            if (isWebKit() && !isDesktopSafari()) {
                return function () {
                    if (isIPad()) {
                        return 'iPad';
                    }
                    return 'iPhone';
                }();
            }
        }
        return platform;
    }
    function getVendor() {
        return navigator.vendor || '';
    }
    /**
     * Checks for browser-specific (not engine specific) global variables to tell browsers with the same engine apart.
     * Only somewhat popular browsers are considered.
     */
    function getVendorFlavors() {
        var flavors = [];
        for (var _i = 0, _a = [
            'chrome',
            'safari',
            '__crWeb', '__gCrWeb',
            'yandex',
            '__yb', '__ybro',
            '__firefox__',
            '__edgeTrackingPreventionStatistics', 'webkit',
            'oprt',
            'samsungAr',
            'ucweb', 'UCShellJava',
            'puffinDevice'
        ]; _i < _a.length; _i++) {
            var key = _a[_i];
            var value = window[key];
            if (value && typeof value === 'object') {
                flavors.push(key);
            }
        }
        return flavors.sort();
    }
    /**
     * navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
     * cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past with
     * site-specific exceptions. Don't rely on it.
     *
     * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js Taken from here
     */
    function areCookiesEnabled() {
        var d = document; // Taken from here: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js
        // navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
        // cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past
        // with site-specific exceptions. Don't rely on it.
        // try..catch because some in situations `document.cookie` is exposed but throws a
        // SecurityError if you try to access it; e.g. documents created from data URIs
        // or in sandboxed iframes (depending on flags/context)
        try {
            // Create cookie
            d.cookie = 'cookietest=1; SameSite=Strict;';
            var result = d.cookie.indexOf('cookietest=') !== -1; // Delete cookie
            d.cookie = 'cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            return result;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Only single element selector are supported (no operators like space, +, >, etc).
     * `embed` and `position: fixed;` will be considered as blocked anyway because it always has no offsetParent.
     * Avoid `iframe` and anything with `[src=]` because they produce excess HTTP requests.
     *
     * See docs/content_blockers.md to learn how to make the list
     */
    var filters = {
        abpIndo: ['#Iklan-Melayang', '#Kolom-Iklan-728', '#SidebarIklan-wrapper', 'a[title="7naga poker" i]', '[title="ALIENBOLA" i]'],
        abpvn: ['#quangcaomb', '.i-said-no-thing-can-stop-me-warning.dark', '.quangcao', '[href^="https://r88.vn/"]', '[href^="https://zbet.vn/"]'],
        adBlockFinland: ['.mainostila', '.sponsorit', '.ylamainos', 'a[href*="/clickthrgh.asp?"]', 'a[href^="https://app.readpeak.com/ads"]'],
        adBlockPersian: ['#navbar_notice_50', 'a[href^="https://iqoption.com/lp/mobile-partner/?aff="]', '.kadr', 'TABLE[width="140px"]', '#divAgahi'],
        adBlockWarningRemoval: ['#adblock_message', '.adblockInfo', '.deadblocker-header-bar', '.no-ad-reminder', '#AdBlockDialog'],
        adGuardAnnoyances: ['amp-embed[type="zen"]', '.hs-sosyal', '#cookieconsentdiv', 'div[class^="app_gdpr"]', '.as-oil'],
        adGuardBase: ['#gads_middle', '.tjads', '.BetterJsPopOverlay', '#ad_300X250', '#bannerfloat22'],
        adGuardChinese: ['a[href*=".123ch.cn"]', 'a[href*=".ttz5.cn"]', 'a[href*=".yabovip2027.com/"]', '.tm3all2h4b', '#j-new-ad'],
        adGuardFrench: ['#div_banniere_pub', 'a[href^="https://secure.securitetotale.fr/"]', 'a[href*="fducks.com/"]', 'a[href^="http://frtyd.com/"]', '.publicite1'],
        adGuardGerman: ['.banneritemwerbung_head_1', '.boxstartwerbung', '.werbung3', 'a[href^="http://www.ichwuerde.com/?ref="]', 'a[href^="http://partners.adklick.de/tracking.php?"]'],
        adGuardJapanese: ['.ad-text-blockA01', '._popIn_infinite_video', '[class^=blogroll_wrapper]', 'a[href^="http://ad2.trafficgate.net/"]', 'a[href^="http://www.rssad.jp/"]'],
        adGuardMobile: ['amp-auto-ads', '#mgid_iframe', '.amp_ad', 'amp-sticky-ad', '.plugin-blogroll'],
        adGuardRussian: ['a[href^="https://ya-distrib.ru/r/"]', '[onclick*=".twkv.ru"]', '.reclama', 'div[id^="smi2adblock"]', 'div[id^="AdFox_banner_"]'],
        adGuardSocial: ['a[href^="//www.stumbleupon.com/submit?url="]', 'a[href^="//telegram.me/share/url?"]', '.etsy-tweet', '#inlineShare', '.popup-social'],
        adGuardSpanishPortuguese: ['#barraPublicidade', '#Publicidade', '#publiEspecial', '#queTooltip', '[href^="http://ads.glispa.com/"]'],
        adGuardTrackingProtection: ['amp-embed[type="taboola"]', '#qoo-counter', 'a[href^="http://click.hotlog.ru/"]', 'a[href^="http://hitcounter.ru/top/stat.php"]', 'a[href^="http://top.mail.ru/jump"]'],
        adGuardTurkish: ['#backkapat', '#reklami', 'a[href^="http://adserv.ontek.com.tr/"]', 'a[href^="http://izlenzi.com/campaign/"]', 'a[href^="http://www.installads.net/"]'],
        bulgarian: ['td#freenet_table_ads', '#newAd', '#ea_intext_div', '.lapni-pop-over', '#xenium_hot_offers'],
        easyList: ['[lazy-ad="leftthin_banner"]', '#ad_300x250_2', '#interstitialAd', '#wide_ad_unit', '.showcaseAd'],
        easyListChina: ['a[href*=".wensixuetang.com/"]', 'A[href*="/hth107.com/"]', '.appguide-wrap[onclick*="bcebos.com"]', '.frontpageAdvM', '#taotaole'],
        easyListCookie: ['#CookieEU', '#__cookies_', '#les_cookies', '.asset_balaNotification', '.gdpr-tab'],
        easyListCzechSlovak: ['#onlajny-stickers', '#reklamni-box', '.reklama-megaboard', '.sklik', '[id^="sklikReklama"]'],
        easyListDutch: ['#advertentie', '#vipAdmarktBannerBlock', '.adstekst', 'a[href^="http://adserver.webads.nl/adclick/"]', '#semilo-lrectangle'],
        easyListGermany: ['#LxWerbeteaser', 'a[href^="http://www.kontakt-vermittler.de/?wm="]', '.werbung301', '.ads_bueroklammer', '#Werbung_Sky'],
        easyListItaly: ['.box_adv_annunci', '.sb-box-pubbliredazionale', 'a[href^="http://affiliazioniads.snai.it/"]', 'a[href^="https://adserver.html.it/"]', 'a[href^="https://affiliazioniads.snai.it/"]'],
        easyListLithuania: ['.reklamos_tarpas', '.reklamos_nuorodos', 'img[alt="Reklaminis skydelis"]', 'img[alt="Dedikuoti.lt serveriai"]', 'img[alt="Hostingas Serveriai.lt"]'],
        estonian: ['A[href*="http://pay4results24.eu"]'],
        fanboyAnnoyances: ['#feedback-tab', '#taboola-below-article', '.feedburnerFeedBlock', '.widget-feedburner-counter', '[title="Subscribe to our blog"]'],
        fanboyAntiFacebook: ['.util-bar-module-firefly-visible'],
        fanboyEnhancedTrackers: ['.open.pushModal', '#issuem-leaky-paywall-articles-zero-remaining-nag', 'div[style*="box-shadow: rgb(136, 136, 136) 0px 0px 12px; color: "]', 'div[class$="-hide"][zoompage-fontsize][style="display: block;"]', '.BlockNag__Card'],
        fanboySocial: ['.td-tags-and-social-wrapper-box', '.twitterContainer', '.youtube-social', 'a[title^="Like us on Facebook"]', 'img[alt^="Share on Digg"]'],
        frellwitSwedish: ['a[href*="casinopro.se"][target="_blank"]', 'a[href*="doktor-se.onelink.me"]', 'article.category-samarbete', 'div.holidAds', 'ul.adsmodern'],
        greekAdBlock: ['A[href*="adman.otenet.gr/click?"]', 'A[href*="http://axiabanners.exodus.gr/"]', 'A[href*="http://interactive.forthnet.gr/click?"]', 'DIV.agores300', 'TABLE.advright'],
        hungarian: ['A[href*="ad.eval.hu"]', 'A[href*="ad.netmedia.hu"]', 'A[href*="daserver.ultraweb.hu"]', '#cemp_doboz', '.optimonk-iframe-container'],
        iDontCareAboutCookies: ['.alert-info[data-block-track*="CookieNotice"]', '.ModuleTemplateCookieIndicator', '.o--cookies--container', '.cookie-msg-info-container', '#cookies-policy-sticky'],
        icelandicAbp: ['A[href^="/framework/resources/forms/ads.aspx"]'],
        latvian: ['a[href="http://www.salidzini.lv/"][style="display: block; width: 120px; height: 40px; overflow: hidden; position: relative;"]', 'a[href="http://www.salidzini.lv/"][style="display: block; width: 88px; height: 31px; overflow: hidden; position: relative;"]'],
        listKr: ['a[href*="//kingtoon.slnk.kr"]', 'a[href*="//playdsb.com/kr"]', 'div.logly-lift-adz', 'div[data-widget_id="ml6EJ074"]', 'ins.daum_ddn_area'],
        listeAr: ['.geminiLB1Ad', '.right-and-left-sponsers', 'a[href*=".aflam.info"]', 'a[href*="booraq.org"]', 'a[href*="dubizzle.com/ar/?utm_source="]'],
        listeFr: ['a[href^="http://promo.vador.com/"]', '#adcontainer_recherche', 'a[href*="weborama.fr/fcgi-bin/"]', '.site-pub-interstitiel', 'div[id^="crt-"][data-criteo-id]'],
        officialPolish: ['#ceneo-placeholder-ceneo-12', '[href^="https://aff.sendhub.pl/"]', 'a[href^="http://advmanager.techfun.pl/redirect/"]', 'a[href^="http://www.trizer.pl/?utm_source"]', 'div#skapiec_ad'],
        ro: ['a[href^="//afftrk.altex.ro/Counter/Click"]', 'a[href^="/magazin/"]', 'a[href^="https://blackfridaysales.ro/trk/shop/"]', 'a[href^="https://event.2performant.com/events/click"]', 'a[href^="https://l.profitshare.ro/"]'],
        ruAd: ['a[href*="//febrare.ru/"]', 'a[href*="//utimg.ru/"]', 'a[href*="://chikidiki.ru"]', '#pgeldiz', '.yandex-rtb-block'],
        thaiAds: ['a[href*=macau-uta-popup]', '#ads-google-middle_rectangle-group', '.ads300s', '.bumq', '.img-kosana'],
        webAnnoyancesUltralist: ['#mod-social-share-2', '#social-tools', '.ctpl-fullbanner', '.zergnet-recommend', '.yt.btn-link.btn-md.btn']
    };
    /** Just a syntax sugar */
    var filterNames = Object.keys(filters);
    /**
     * The returned array order means nothing (it's always sorted alphabetically).
     *
     * Notice that the source is slightly unstable.
     * Safari provides a 2-taps way to disable all content blockers on a page temporarily.
     * Also content blockers can be disabled permanently for a domain, but it requires 4 taps.
     * So empty array shouldn't be treated as "no blockers", it should be treated as "no signal".
     * If you are a website owner, don't make your visitors want to disable content blockers.
     */
    function getDomBlockers(_a) {
        var debug = function () {
            if (_a === void 0) {
                return {};
            }
            return _a;
        }().debug;
        return __awaiter(this, void 0, void 0, function () {
            var allSelectors, blockedSelectors, activeBlockers;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!isApplicable()) {
                            return [2
                                /*return*/
                                ,
                                undefined];
                        }
                        allSelectors = (_b = []).concat.apply(_b, filterNames.map(function (filterName) {
                            return filters[filterName];
                        }));
                        return [4
                            /*yield*/
                            ,
                            getBlockedSelectors(allSelectors)];
                    case 1:
                        blockedSelectors = _c.sent();
                        if (debug) {
                            printDebug(blockedSelectors);
                        }
                        activeBlockers = filterNames.filter(function (filterName) {
                            var selectors = filters[filterName];
                            var blockedCount = countTruthy(selectors.map(function (selector) {
                                return blockedSelectors[selector];
                            }));
                            return blockedCount > selectors.length * 0.5;
                        });
                        activeBlockers.sort();
                        return [2
                            /*return*/
                            ,
                            activeBlockers];
                }
            });
        });
    }
    function isApplicable() {
        // Safari (desktop and mobile) and all Android browsers keep content blockers in both regular and private mode
        return isWebKit() || isAndroid();
    }
    function getBlockedSelectors(selectors) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var d, root, elements, blockedSelectors, _i, selectors_1, selector, element, holder, i;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        d = document;
                        root = d.createElement('div');
                        elements = [];
                        blockedSelectors = {} // Set() isn't used just in case somebody need older browser support
                        ;
                        forceShow(root); // First create all elements that can be blocked. If the DOM steps below are done in a single cycle,
                        // browser will alternate tree modification and layout reading, that is very slow.
                        for (_i = 0, selectors_1 = selectors; _i < selectors_1.length; _i++) {
                            selector = selectors_1[_i];
                            element = selectorToElement(selector);
                            holder = d.createElement('div') // Protects from unwanted effects of `+` and `~` selectors of filters
                            ;
                            forceShow(holder);
                            holder.appendChild(element);
                            root.appendChild(holder);
                            elements.push(element);
                        }
                        _b.label = 1;
                    case 1:
                        if (!!d.body)
                            return [3
                                /*break*/
                                ,
                                3];
                        return [4
                            /*yield*/
                            ,
                            wait(50)];
                    case 2:
                        _b.sent();
                        return [3
                            /*break*/
                            ,
                            1];
                    case 3:
                        d.body.appendChild(root);
                        try {
                            // Then check which of the elements are blocked
                            for (i = 0; i < selectors.length; ++i) {
                                if (!elements[i].offsetParent) {
                                    blockedSelectors[selectors[i]] = true;
                                }
                            }
                        }
                        finally {
                            // Then remove the elements
                            (function () {
                                if ((_a = root.parentNode) === null || _a === void 0) {
                                    return void 0;
                                }
                                return _a.removeChild(root);
                            })();
                        }
                        return [2
                            /*return*/
                            ,
                            blockedSelectors];
                }
            });
        });
    }
    function forceShow(element) {
        element.style.setProperty('display', 'block', 'important');
    }
    function printDebug(blockedSelectors) {
        var message = 'DOM blockers debug:\n```';
        for (var _i = 0, filterNames_1 = filterNames; _i < filterNames_1.length; _i++) {
            var filterName = filterNames_1[_i];
            message += "\n" + filterName + ":";
            for (var _a = 0, _b = filters[filterName]; _a < _b.length; _a++) {
                var selector = _b[_a];
                message += "\n  " + selector + " " + function () {
                    if (blockedSelectors[selector]) {
                        return '🚫';
                    }
                    return '➡️';
                }();
            }
        } // console.log is ok here because it's under a debug clause
        // eslint-disable-next-line no-console
        console.log(message + "\n```");
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut
     */
    function getColorGamut() {
        // rec2020 includes p3 and p3 includes srgb
        for (var _i = 0, _a = ['rec2020', 'p3', 'srgb']; _i < _a.length; _i++) {
            var gamut = _a[_i];
            if (matchMedia("(color-gamut: " + gamut + ")").matches) {
                return gamut;
            }
        }
        return undefined;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/inverted-colors
     */
    function areColorsInverted() {
        if (doesMatch('inverted')) {
            return true;
        }
        if (doesMatch('none')) {
            return false;
        }
        return undefined;
    }
    function doesMatch(value) {
        return matchMedia("(inverted-colors: " + value + ")").matches;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
     */
    function areColorsForced() {
        if (doesMatch$1('active')) {
            return true;
        }
        if (doesMatch$1('none')) {
            return false;
        }
        return undefined;
    }
    function doesMatch$1(value) {
        return matchMedia("(forced-colors: " + value + ")").matches;
    }
    var maxValueToCheck = 100;
    /**
     * If the display is monochrome (e.g. black&white), the value will be ≥0 and will mean the number of bits per pixel.
     * If the display is not monochrome, the returned value will be 0.
     * If the browser doesn't support this feature, the returned value will be undefined.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/monochrome
     */
    function getMonochromeDepth() {
        if (!matchMedia('(min-monochrome: 0)').matches) {
            // The media feature isn't supported by the browser
            return undefined;
        } // A variation of binary search algorithm can be used here.
        // But since expected values are very small (≤10), there is no sense in adding the complexity.
        for (var i = 0; i <= maxValueToCheck; ++i) {
            if (matchMedia("(max-monochrome: " + i + ")").matches) {
                return i;
            }
        }
        throw new Error('Too high value');
    }
    /**
     * @see https://www.w3.org/TR/mediaqueries-5/#prefers-contrast
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
     */
    function getContrastPreference() {
        if (doesMatch$2('no-preference')) {
            return 0;
        } // The sources contradict on the keywords. Probably 'high' and 'low' will never be implemented.
        // Need to check it when all browsers implement the feature.
        if (doesMatch$2('high') || doesMatch$2('more')) {
            return 1;
        }
        if (doesMatch$2('low') || doesMatch$2('less')) {
            return -1;
        }
        if (doesMatch$2('forced')) {
            return 10;
        }
        return undefined;
    }
    function doesMatch$2(value) {
        return matchMedia("(prefers-contrast: " + value + ")").matches;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
     */
    function isMotionReduced() {
        if (doesMatch$3('reduce')) {
            return true;
        }
        if (doesMatch$3('no-preference')) {
            return false;
        }
        return undefined;
    }
    function doesMatch$3(value) {
        return matchMedia("(prefers-reduced-motion: " + value + ")").matches;
    }
    /**
     * @see https://www.w3.org/TR/mediaqueries-5/#dynamic-range
     */
    function isHDR() {
        if (doesMatch$4('high')) {
            return true;
        }
        if (doesMatch$4('standard')) {
            return false;
        }
        return undefined;
    }
    function doesMatch$4(value) {
        return matchMedia("(dynamic-range: " + value + ")").matches;
    }
    var M = Math; // To reduce the minified code size
    var fallbackFn = function () {
        return 0;
    }; // Native operations
    var acos = M.acos || fallbackFn;
    var acosh = M.acosh || fallbackFn;
    var asin = M.asin || fallbackFn;
    var asinh = M.asinh || fallbackFn;
    var atanh = M.atanh || fallbackFn;
    var atan = M.atan || fallbackFn;
    var sin = M.sin || fallbackFn;
    var sinh = M.sinh || fallbackFn;
    var cos = M.cos || fallbackFn;
    var cosh = M.cosh || fallbackFn;
    var tan = M.tan || fallbackFn;
    var tanh = M.tanh || fallbackFn;
    var exp = M.exp || fallbackFn;
    var expm1 = M.expm1 || fallbackFn;
    var log1p = M.log1p || fallbackFn; // Operation polyfills
    var powPI = function (value) {
        return M.pow(M.PI, value);
    };
    var acoshPf = function (value) {
        return M.log(value + M.sqrt(value * value - 1));
    };
    var asinhPf = function (value) {
        return M.log(value + M.sqrt(value * value + 1));
    };
    var atanhPf = function (value) {
        return M.log((1 + value) / (1 - value)) / 2;
    };
    var sinhPf = function (value) {
        return M.exp(value) - 1 / M.exp(value) / 2;
    };
    var coshPf = function (value) {
        return (M.exp(value) + 1 / M.exp(value)) / 2;
    };
    var expm1Pf = function (value) {
        return M.exp(value) - 1;
    };
    var tanhPf = function (value) {
        return (M.exp(2 * value) - 1) / (M.exp(2 * value) + 1);
    };
    var log1pPf = function (value) {
        return M.log(1 + value);
    };
    /**
     * @see https://gitlab.torproject.org/legacy/trac/-/issues/13018
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=531915
     */
    function getMathFingerprint() {
        // Note: constant values are empirical
        return {
            acos: acos(0.123124234234234242),
            acosh: acosh(1e308),
            acoshPf: acoshPf(1e154),
            asin: asin(0.123124234234234242),
            asinh: asinh(1),
            asinhPf: asinhPf(1),
            atanh: atanh(0.5),
            atanhPf: atanhPf(0.5),
            atan: atan(0.5),
            sin: sin(-1e300),
            sinh: sinh(1),
            sinhPf: sinhPf(1),
            cos: cos(10.000000000123),
            cosh: cosh(1),
            coshPf: coshPf(1),
            tan: tan(-1e300),
            tanh: tanh(1),
            tanhPf: tanhPf(1),
            exp: exp(1),
            expm1: expm1(1),
            expm1Pf: expm1Pf(1),
            log1p: log1p(10),
            log1pPf: log1pPf(10),
            powPI: powPI(-100)
        };
    }
    /**
     * We use m or w because these two characters take up the maximum width.
     * Also there are a couple of ligatures.
     */
    var defaultText = 'mmMwWLliI0fiflO&1';
    /**
     * Settings of text blocks to measure. The keys are random but persistent words.
     */
    var presets = {
        /**
         * The default font. User can change it in desktop Chrome, desktop Firefox, IE 11,
         * Android Chrome (but only when the size is ≥ than the default) and Android Firefox.
         */
        default: [],
        /** OS font on macOS. User can change its size and weight. Applies after Safari restart. */
        apple: [{
            font: '-apple-system-body'
        }],
        /** User can change it in desktop Chrome and desktop Firefox. */
        serif: [{
            fontFamily: 'serif'
        }],
        /** User can change it in desktop Chrome and desktop Firefox. */
        sans: [{
            fontFamily: 'sans-serif'
        }],
        /** User can change it in desktop Chrome and desktop Firefox. */
        mono: [{
            fontFamily: 'monospace'
        }],
        /**
         * Check the minimal allowed font size. User can change it in desktop Chrome, desktop Firefox and desktop Safari.
         * The height can be 0 in Chrome on a retina display.
         */
        min: [{
            fontSize: '1px'
        }],
        /** Tells one OS from another in desktop Chrome. */
        system: [{
            fontFamily: 'system-ui'
        }]
    };
    /**
     * The result is a dictionary of the width of the text samples.
     * Heights aren't included because they give no extra entropy and are unstable.
     *
     * The result is very stable in IE 11, Edge 18 and Safari 14.
     * The result changes when the OS pixel density changes in Chromium 87. The real pixel density is required to solve,
     * but seems like it's impossible: https://stackoverflow.com/q/1713771/1118709.
     * The "min" and the "mono" (only on Windows) value may change when the page is zoomed in Firefox 87.
     */
    function getFontPreferences() {
        return withNaturalFonts(function (document, container) {
            var elements = {};
            var sizes = {}; // First create all elements to measure. If the DOM steps below are done in a single cycle,
            // browser will alternate tree modification and layout reading, that is very slow.
            for (var _i = 0, _a = Object.keys(presets); _i < _a.length; _i++) {
                var key = _a[_i];
                var _b = presets[key], _c = _b[0], style = function () {
                    if (_c === void 0) {
                        return {};
                    }
                    return _c;
                }(), _d = _b[1], text = function () {
                    if (_d === void 0) {
                        return defaultText;
                    }
                    return _d;
                }();
                var element = document.createElement('span');
                element.textContent = text;
                element.style.whiteSpace = 'nowrap';
                for (var _e = 0, _f = Object.keys(style); _e < _f.length; _e++) {
                    var name_1 = _f[_e];
                    var value = style[name_1];
                    if (value !== undefined) {
                        element.style[name_1] = value;
                    }
                }
                elements[key] = element;
                container.appendChild(document.createElement('br'));
                container.appendChild(element);
            } // Then measure the created elements
            for (var _g = 0, _h = Object.keys(presets); _g < _h.length; _g++) {
                var key = _h[_g];
                sizes[key] = elements[key].getBoundingClientRect().width;
            }
            return sizes;
        });
    }
    /**
     * Creates a DOM environment that provides the most natural font available, including Android OS font.
     * Measurements of the elements are zoom-independent.
     * Don't put a content to measure inside an absolutely positioned element.
     */
    function withNaturalFonts(action, containerWidthPx) {
        if (containerWidthPx === void 0) {
            containerWidthPx = 4000;
        }
        /*
     * Requirements for Android Chrome to apply the system font size to a text inside an iframe:
     * - The iframe mustn't have a `display: none;` style;
     * - The text mustn't be positioned absolutely;
     * - The text block must be wide enough.
     *   2560px on some devices in portrait orientation for the biggest font size option (32px);
     * - There must be much enough text to form a few lines (I don't know the exact numbers);
     * - The text must have the `text-size-adjust: none` style. Otherwise the text will scale in "Desktop site" mode;
     *
     * Requirements for Android Firefox to apply the system font size to a text inside an iframe:
     * - The iframe document must have a header: `<meta name="viewport" content="width=device-width, initial-scale=1" />`.
     *   The only way to set it is to use the `srcdoc` attribute of the iframe;
     * - The iframe content must get loaded before adding extra content with JavaScript;
     *
     * https://example.com as the iframe target always inherits Android font settings so it can be used as a reference.
     *
     * Observations on how page zoom affects the measurements:
     * - macOS Safari 11.1, 12.1, 13.1, 14.0: zoom reset + offsetWidth = 100% reliable;
     * - macOS Safari 11.1, 12.1, 13.1, 14.0: zoom reset + getBoundingClientRect = 100% reliable;
     * - macOS Safari 14.0: offsetWidth = 5% fluctuation;
     * - macOS Safari 14.0: getBoundingClientRect = 5% fluctuation;
     * - iOS Safari 9, 10, 11.0, 12.0: haven't found a way to zoom a page (pinch doesn't change layout);
     * - iOS Safari 13.1, 14.0: zoom reset + offsetWidth = 100% reliable;
     * - iOS Safari 13.1, 14.0: zoom reset + getBoundingClientRect = 100% reliable;
     * - iOS Safari 14.0: offsetWidth = 100% reliable;
     * - iOS Safari 14.0: getBoundingClientRect = 100% reliable;
     * - Chrome 42, 65, 80, 87: zoom 1/devicePixelRatio + offsetWidth = 1px fluctuation;
     * - Chrome 42, 65, 80, 87: zoom 1/devicePixelRatio + getBoundingClientRect = 100% reliable;
     * - Chrome 87: offsetWidth = 1px fluctuation;
     * - Chrome 87: getBoundingClientRect = 0.7px fluctuation;
     * - Firefox 48, 51: offsetWidth = 10% fluctuation;
     * - Firefox 48, 51: getBoundingClientRect = 10% fluctuation;
     * - Firefox 52, 53, 57, 62, 66, 67, 68, 71, 75, 80, 84: offsetWidth = width 100% reliable, height 10% fluctuation;
     * - Firefox 52, 53, 57, 62, 66, 67, 68, 71, 75, 80, 84: getBoundingClientRect = width 100% reliable, height 10%
     *   fluctuation;
     * - Android Chrome 86: haven't found a way to zoom a page (pinch doesn't change layout);
     * - Android Firefox 84: font size in accessibility settings changes all the CSS sizes, but offsetWidth and
     *   getBoundingClientRect keep measuring with regular units, so the size reflects the font size setting and doesn't
     *   fluctuate;
     * - IE 11, Edge 18: zoom 1/devicePixelRatio + offsetWidth = 100% reliable;
     * - IE 11, Edge 18: zoom 1/devicePixelRatio + getBoundingClientRect = reflects the zoom level;
     * - IE 11, Edge 18: offsetWidth = 100% reliable;
     * - IE 11, Edge 18: getBoundingClientRect = 100% reliable;
     */
        return withIframe(function (_, iframeWindow) {
            var iframeDocument = iframeWindow.document;
            var iframeBody = iframeDocument.body;
            var bodyStyle = iframeBody.style;
            bodyStyle.width = containerWidthPx + "px";
            bodyStyle.webkitTextSizeAdjust = bodyStyle.textSizeAdjust = 'none'; // See the big comment above
            if (isChromium()) {
                iframeBody.style.zoom = "" + 1 / iframeWindow.devicePixelRatio;
            }
            else if (isWebKit()) {
                iframeBody.style.zoom = 'reset';
            } // See the big comment above
            var linesOfText = iframeDocument.createElement('div');
            linesOfText.textContent = __spreadArrays(Array(containerWidthPx / 20 << 0)).map(function () {
                return 'word';
            }).join(' ');
            iframeBody.appendChild(linesOfText);
            return action(iframeDocument, iframeBody);
        }, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">');
    }
    /**
     * The list of entropy sources used to make visitor identifiers.
     *
     * This value isn't restricted by Semantic Versioning, i.e. it may be changed without bumping minor or major version of
     * this package.
     */
    var sources = {
        // Expected errors and default values must be handled inside the functions. Unexpected errors must be thrown.
        // The sources run in this exact order. The asynchronous sources are at the start to run in parallel with other sources.
        fonts: getFonts,
        domBlockers: getDomBlockers,
        fontPreferences: getFontPreferences,
        audio: getAudioFingerprint,
        screenFrame: getRoundedScreenFrame,
        osCpu: getOsCpu,
        languages: getLanguages,
        colorDepth: getColorDepth,
        deviceMemory: getDeviceMemory,
        screenResolution: getScreenResolution,
        hardwareConcurrency: getHardwareConcurrency,
        timezone: getTimezone,
        sessionStorage: getSessionStorage,
        localStorage: getLocalStorage,
        indexedDB: getIndexedDB,
        openDatabase: getOpenDatabase,
        cpuClass: getCpuClass,
        platform: getPlatform,
        plugins: getPlugins,
        canvas: getCanvasFingerprint,
        touchSupport: getTouchSupport,
        vendor: getVendor,
        vendorFlavors: getVendorFlavors,
        cookiesEnabled: areCookiesEnabled,
        colorGamut: getColorGamut,
        invertedColors: areColorsInverted,
        forcedColors: areColorsForced,
        monochrome: getMonochromeDepth,
        contrast: getContrastPreference,
        reducedMotion: isMotionReduced,
        hdr: isHDR,
        math: getMathFingerprint
    };
    function ensureErrorWithMessage(error) {
        return function () {
            if (error && typeof error === 'object' && 'message' in error) {
                return error;
            }
            return {
                message: error
            };
        }();
    }
    /**
     * Gets a component from the given entropy source.
     */
    function getComponent(source, sourceOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var result, startTime, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = {};
                        return [4
                            /*yield*/
                            ,
                            source(sourceOptions)];
                    case 2:
                        result = (_a.value = _b.sent(), _a);
                        return [3
                            /*break*/
                            ,
                            4];
                    case 3:
                        error_1 = _b.sent();
                        result = {
                            error: ensureErrorWithMessage(error_1)
                        };
                        return [3
                            /*break*/
                            ,
                            4];
                    case 4:
                        return [2
                            /*return*/
                            ,
                            __assign(__assign({}, result), {
                                duration: Date.now() - startTime
                            })];
                }
            });
        });
    }
    /**
     * Gets a components list from the given list of entropy sources.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function getComponents(sources, sourceOptions, excludeSources) {
        return __awaiter(this, void 0, void 0, function () {
            var sourcePromises, components, loopReleaseInterval, lastLoopReleaseTime, _loop_1, _i, _a, sourceKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sourcePromises = [];
                        components = {};
                        loopReleaseInterval = 16;
                        lastLoopReleaseTime = Date.now();
                        _loop_1 = function (sourceKey) {
                            var now;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!excludes(excludeSources, sourceKey)) {
                                            return [2
                                                /*return*/
                                                ,
                                                "continue"];
                                        } // Create the keys immediately to keep the component keys order the same as the sources keys order
                                        components[sourceKey] = undefined;
                                        sourcePromises.push(getComponent(sources[sourceKey], sourceOptions).then(function (component) {
                                            components[sourceKey] = component;
                                        }));
                                        now = Date.now();
                                        if (!(now >= lastLoopReleaseTime + loopReleaseInterval))
                                            return [3
                                                /*break*/
                                                ,
                                                2];
                                        lastLoopReleaseTime = now; // Allows asynchronous sources to complete and measure the duration correctly before running the next sources
                                        return [4
                                            /*yield*/
                                            ,
                                            new Promise(function (resolve) {
                                                return setTimeout(resolve);
                                            })];
                                    case 1:
                                        // Allows asynchronous sources to complete and measure the duration correctly before running the next sources
                                        _a.sent();
                                        return [3
                                            /*break*/
                                            ,
                                            4];
                                    case 2:
                                        return [4
                                            /*yield*/
                                            ,
                                            undefined];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        return [2
                                            /*return*/
                                        ];
                                }
                            });
                        };
                        _i = 0, _a = Object.keys(sources);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length))
                            return [3
                                /*break*/
                                ,
                                4];
                        sourceKey = _a[_i];
                        return [5
                            /*yield**/
                            ,
                            _loop_1(sourceKey)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3
                            /*break*/
                            ,
                            1];
                    case 4:
                        return [4
                            /*yield*/
                            ,
                            Promise.all(sourcePromises)];
                    case 5:
                        _b.sent();
                        return [2
                            /*return*/
                            ,
                            components];
                }
            });
        });
    }
    /**
     * Collects entropy components from the built-in sources to make the visitor identifier.
     */
    function getBuiltinComponents(options) {
        return getComponents(sources, options, []);
    }
    function componentsToCanonicalString(components) {
        var result = '';
        for (var _i = 0, _a = Object.keys(components).sort(); _i < _a.length; _i++) {
            var componentKey = _a[_i];
            var component = components[componentKey];
            var value = function () {
                if (component.error) {
                    return 'error';
                }
                return JSON.stringify(component.value);
            }();
            result += "" + function () {
                if (result) {
                    return '|';
                }
                return '';
            }() + componentKey.replace(/([:|\\])/g, '\\$1') + ":" + value;
        }
        return result;
    }
    function componentsToDebugString(components) {
        return JSON.stringify(components, function (_key, value) {
            if (value instanceof Error) {
                return errorToObject(value);
            }
            return value;
        }, 2);
    }
    function hashComponents(components) {
        return x64hash128(componentsToCanonicalString(components));
    }
    /**
     * Makes a GetResult implementation that calculates the visitor id hash on demand.
     * Designed for optimisation.
     */
    function makeLazyGetResult(components) {
        var visitorIdCache; // A plain class isn't used because its getters and setters aren't enumerable.
        return {
            components: components,
            get visitorId() {
                if (visitorIdCache === undefined) {
                    visitorIdCache = hashComponents(this.components);
                }
                return visitorIdCache;
            },
            set visitorId(visitorId) {
                visitorIdCache = visitorId;
            },
            version: version
        };
    }
    /**
     * The class isn't exported from the index file to not expose the constructor.
     * The hiding gives more freedom for future non-breaking updates.
     */
    var OpenAgent =
        /** @class */
        function () {
            function OpenAgent() {
                watchScreenFrame();
            }
            /**
             * @inheritDoc
             */
            OpenAgent.prototype.get = function (options) {
                if (options === void 0) {
                    options = {};
                }
                return __awaiter(this, void 0, void 0, function () {
                    var components, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                return [4
                                    /*yield*/
                                    ,
                                    getBuiltinComponents(options)];
                            case 1:
                                components = _a.sent();
                                result = makeLazyGetResult(components);
                                if (options.debug) {
                                    // console.log is ok here because it's under a debug clause
                                    // eslint-disable-next-line no-console
                                    console.log("Copy the text below to get the debug data:\n\n```\nversion: " + result.version + "\nuserAgent: " + navigator.userAgent + "\ngetOptions: " + JSON.stringify(options, undefined, 2) + "\nvisitorId: " + result.visitorId + "\ncomponents: " + componentsToDebugString(components) + "\n```");
                                }
                                return [2
                                    /*return*/
                                    ,
                                    result];
                        }
                    });
                });
            };
            return OpenAgent;
        }();
    /**
     * Builds an instance of Agent and waits a delay required for a proper operation.
     */
    function load(_a) {
        var _b = function () {
            if (_a === void 0) {
                return {};
            }
            return _a;
        }().delayFallback, delayFallback = function () {
            if (_b === void 0) {
                return 50;
            }
            return _b;
        }();
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // A delay is required to ensure consistent entropy components.
                        // See https://github.com/fingerprintjs/fingerprintjs/issues/254
                        // and https://github.com/fingerprintjs/fingerprintjs/issues/307
                        // and https://github.com/fingerprintjs/fingerprintjs/commit/945633e7c5f67ae38eb0fea37349712f0e669b18
                        // A proper deadline is unknown. Let it be twice the fallback timeout so that both cases have the same average time.
                        return [4
                            /*yield*/
                            ,
                            requestIdleCallbackIfAvailable(delayFallback, delayFallback * 2)];
                    case 1:
                        // A delay is required to ensure consistent entropy components.
                        // See https://github.com/fingerprintjs/fingerprintjs/issues/254
                        // and https://github.com/fingerprintjs/fingerprintjs/issues/307
                        // and https://github.com/fingerprintjs/fingerprintjs/commit/945633e7c5f67ae38eb0fea37349712f0e669b18
                        // A proper deadline is unknown. Let it be twice the fallback timeout so that both cases have the same average time.
                        _c.sent();
                        return [2
                            /*return*/
                            ,
                            new OpenAgent()];
                }
            });
        });
    } // The default export is a syntax sugar (`import * as FP from '...' → import FP from '...'`).
// It should contain all the public exported values.
    var index = {
        load: load,
        hashComponents: hashComponents,
        componentsToDebugString: componentsToDebugString
    }; // The exports below are for private usage. They may change unexpectedly. Use them at your own risk.

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
        return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var js_cookie = createCommonjsModule(function (module, exports) {
        (function (factory) {
            var registeredInModuleLoader;
            {
                module.exports = factory();
                registeredInModuleLoader = true;
            }
            if (!registeredInModuleLoader) {
                var OldCookies = window.Cookies;
                var api = window.Cookies = factory();
                api.noConflict = function () {
                    window.Cookies = OldCookies;
                    return api;
                };
            }
        })(function () {
            function extend() {
                var i = 0;
                var result = {};
                for (; i < arguments.length; i++) {
                    var attributes = arguments[i];
                    for (var key in attributes) {
                        result[key] = attributes[key];
                    }
                }
                return result;
            }
            function decode(s) {
                return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
            }
            function init(converter) {
                function api() { }
                function set(key, value, attributes) {
                    if (typeof document === 'undefined') {
                        return;
                    }
                    attributes = extend({
                        path: '/'
                    }, api.defaults, attributes);
                    if (typeof attributes.expires === 'number') {
                        attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
                    } // We're using "expires" because "max-age" is not supported by IE
                    attributes.expires = function () {
                        if (attributes.expires) {
                            return attributes.expires.toUTCString();
                        }
                        return '';
                    }();
                    try {
                        var result = JSON.stringify(value);
                        if (/^[\{\[]/.test(result)) {
                            value = result;
                        }
                    }
                    catch (e) { }
                    value = function () {
                        if (converter.write) {
                            return converter.write(value, key);
                        }
                        return encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
                    }();
                    key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);
                    var stringifiedAttributes = '';
                    for (var attributeName in attributes) {
                        if (!attributes[attributeName]) {
                            continue;
                        }
                        stringifiedAttributes += '; ' + attributeName;
                        if (attributes[attributeName] === true) {
                            continue;
                        } // Considers RFC 6265 section 5.2:
                        // ...
                        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
                        //     character:
                        // Consume the characters of the unparsed-attributes up to,
                        // not including, the first %x3B (";") character.
                        // ...
                        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
                    }
                    return document.cookie = key + '=' + value + stringifiedAttributes;
                }
                function get(key, json) {
                    if (typeof document === 'undefined') {
                        return;
                    }
                    var jar = {}; // To prevent the for loop in the first place assign an empty array
                    // in case there are no cookies at all.
                    var cookies = function () {
                        if (document.cookie) {
                            return document.cookie.split('; ');
                        }
                        return [];
                    }();
                    var i = 0;
                    for (; i < cookies.length; i++) {
                        var parts = cookies[i].split('=');
                        var cookie = parts.slice(1).join('=');
                        if (!json && cookie.charAt(0) === '"') {
                            cookie = cookie.slice(1, -1);
                        }
                        try {
                            var name = decode(parts[0]);
                            cookie = (converter.read || converter)(cookie, name) || decode(cookie);
                            if (json) {
                                try {
                                    cookie = JSON.parse(cookie);
                                }
                                catch (e) { }
                            }
                            jar[name] = cookie;
                            if (key === name) {
                                break;
                            }
                        }
                        catch (e) { }
                    }
                    return function () {
                        if (key) {
                            return jar[key];
                        }
                        return jar;
                    }();
                }
                api.set = set;
                api.get = function (key) {
                    return get(key, false
                        /* read as raw */
                    );
                };
                api.getJSON = function (key) {
                    return get(key, true
                        /* read as json */
                    );
                };
                api.remove = function (key, attributes) {
                    set(key, '', extend(attributes, {
                        expires: -1
                    }));
                };
                api.defaults = {};
                api.withConverter = init;
                return api;
            }
            return init(function () { });
        });
    });

//
    var DEFAULT_COOKIE_TTL = 365; // Days.
// If this script is executing in a cross-origin iframe, the cookie must
// be set with SameSite=None and Secure=true. See
// https://web.dev/samesite-cookies-explained/ and
// https://tools.ietf.org/html/draft-west-cookie-incrementalism-00 for
// details on SameSite and cross-origin behavior.
    var CROSS_ORIGIN_IFRAME = amIInsideACrossOriginIframe();
    var DEFAULT_SECURE = (CROSS_ORIGIN_IFRAME ? true : false);
    var DEFAULT_SAMESITE = (CROSS_ORIGIN_IFRAME ? 'None' : 'Lax');
    function amIInsideACrossOriginIframe() {
        try {
            // Raises ReferenceError if window isn't defined, eg if executed
            // outside a browser.
            //
            // If inside a cross-origin iframe, raises: Uncaught
            // DOMException: Blocked a frame with origin "..." from
            // accessing a cross-origin frame.
            return !Boolean(window.top.location.href);
        }
        catch (err) {
            return true;
        }
    }
    var CookieStore = /** @class */ (function () {
        function CookieStore(_a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, _c = _b.ttl, ttl = _c === void 0 ? DEFAULT_COOKIE_TTL : _c, _d = _b.secure, secure = _d === void 0 ? DEFAULT_SECURE : _d, _e = _b.sameSite, sameSite = _e === void 0 ? DEFAULT_SAMESITE : _e;
            this.ttl = ttl;
            this.secure = secure;
            this.sameSite = sameSite;
            return (function () { return __awaiter$1(_this, void 0, void 0, function () { return __generator$1(this, function (_a) {
                return [2 /*return*/, this];
            }); }); })();
        }
        CookieStore.prototype.get = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                var value;
                return __generator$1(this, function (_a) {
                    value = js_cookie.get(key);
                    return [2 /*return*/, typeof value === 'string' ? value : undefined];
                });
            });
        };
        CookieStore.prototype.set = function (key, value) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    js_cookie.set(key, value, this._constructCookieParams());
                    return [2 /*return*/];
                });
            });
        };
        CookieStore.prototype.remove = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    js_cookie.remove(key, this._constructCookieParams());
                    return [2 /*return*/];
                });
            });
        };
        CookieStore.prototype._constructCookieParams = function () {
            return {
                expires: this.ttl,
                secure: this.secure,
                sameSite: this.sameSite,
            };
        };
        return CookieStore;
    }());

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var info = gen[key](arg);
            var value = info.value;
        } catch (error) {
            reject(error);
            return;
        }

        if (info.done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(_next, _throw);
        }
    }

    function _asyncToGenerator(fn) {
        return function () {
            var self = this,
                args = arguments;
            return new Promise(function (resolve, reject) {
                var gen = fn.apply(self, args);

                function _next(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
                }

                function _throw(err) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
                }

                _next(undefined);
            });
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    var Store = /*#__PURE__*/function () {
        function Store() {
            var dbName = function () {
                if (arguments.length > 0 && arguments[0] !== undefined) {
                    return arguments[0];
                }

                return 'keyval-store';
            }();

            var storeName = function () {
                if (arguments.length > 1 && arguments[1] !== undefined) {
                    return arguments[1];
                }

                return 'keyval';
            }();

            _classCallCheck(this, Store);

            this.storeName = storeName;
            this._dbp = new Promise(function (resolve, reject) {
                var openreq = indexedDB.open(dbName, 1);

                openreq.onerror = function () {
                    return reject(openreq.error);
                };

                openreq.onsuccess = function () {
                    return resolve(openreq.result);
                }; // First time setup: create an empty object store


                openreq.onupgradeneeded = function () {
                    openreq.result.createObjectStore(storeName);
                };
            });
        }

        _createClass(Store, [{
            key: "_withIDBStore",
            value: function _withIDBStore(type, callback) {
                var _this = this;

                return this._dbp.then(function (db) {
                    return new Promise(function (resolve, reject) {
                        var transaction = db.transaction(_this.storeName, type);

                        transaction.oncomplete = function () {
                            return resolve();
                        };

                        transaction.onabort = transaction.onerror = function () {
                            return reject(transaction.error);
                        };

                        callback(transaction.objectStore(_this.storeName));
                    });
                });
            }
        }]);

        return Store;
    }();

    var store;

    function getDefaultStore() {
        if (!store) store = new Store();
        return store;
    }

    function get(key) {
        var store = function () {
            if (arguments.length > 1 && arguments[1] !== undefined) {
                return arguments[1];
            }

            return getDefaultStore();
        }();

        var req;
        return store._withIDBStore('readonly', function (store) {
            req = store.get(key);
        }).then(function () {
            return req.result;
        });
    }

    function set(key, value) {
        var store = function () {
            if (arguments.length > 2 && arguments[2] !== undefined) {
                return arguments[2];
            }

            return getDefaultStore();
        }();

        return store._withIDBStore('readwrite', function (store) {
            store.put(value, key);
        });
    }

    function del(key) {
        var store = function () {
            if (arguments.length > 1 && arguments[1] !== undefined) {
                return arguments[1];
            }

            return getDefaultStore();
        }();

        return store._withIDBStore('readwrite', function (store) {
            store.delete(key);
        });
    }

//
    var DEFAULT_DATABASE_NAME = 'ImmortalDB';
    var DEFAULT_STORE_NAME = 'key-value-pairs';
    var IndexedDbStore = /** @class */ (function () {
        function IndexedDbStore(dbName, storeName) {
            var _this = this;
            if (dbName === void 0) { dbName = DEFAULT_DATABASE_NAME; }
            if (storeName === void 0) { storeName = DEFAULT_STORE_NAME; }
            this.store = new Store(dbName, storeName);
            return (function () { return __awaiter$1(_this, void 0, void 0, function () {
                var err_1;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.store._dbp];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _a.sent();
                            if (err_1.name === 'SecurityError') {
                                return [2 /*return*/, null]; // Failed to open an IndexedDB database.
                            }
                            else {
                                throw err_1;
                            }
                        case 3: return [2 /*return*/, this];
                    }
                });
            }); })();
        }
        IndexedDbStore.prototype.get = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                var value;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, get(key, this.store)];
                        case 1:
                            value = _a.sent();
                            return [2 /*return*/, typeof value === 'string' ? value : undefined];
                    }
                });
            });
        };
        IndexedDbStore.prototype.set = function (key, value) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, set(key, value, this.store)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        IndexedDbStore.prototype.remove = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, del(key, this.store)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return IndexedDbStore;
    }());

//
    var StorageApiWrapper = /** @class */ (function () {
        function StorageApiWrapper(store) {
            var _this = this;
            this.store = store;
            return (function () { return __awaiter$1(_this, void 0, void 0, function () { return __generator$1(this, function (_a) {
                return [2 /*return*/, this];
            }); }); })();
        }
        StorageApiWrapper.prototype.get = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                var value;
                return __generator$1(this, function (_a) {
                    value = this.store.getItem(key);
                    return [2 /*return*/, typeof value === 'string' ? value : undefined];
                });
            });
        };
        StorageApiWrapper.prototype.set = function (key, value) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    this.store.setItem(key, value);
                    return [2 /*return*/];
                });
            });
        };
        StorageApiWrapper.prototype.remove = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    this.store.removeItem(key);
                    return [2 /*return*/];
                });
            });
        };
        return StorageApiWrapper;
    }());
    var LocalStorageStore = /** @class */ (function (_super) {
        __extends(LocalStorageStore, _super);
        function LocalStorageStore() {
            return _super.call(this, window.localStorage) || this;
        }
        return LocalStorageStore;
    }(StorageApiWrapper));
    /** @class */ ((function (_super) {
        __extends(SessionStorageStore, _super);
        function SessionStorageStore() {
            return _super.call(this, window.sessionStorage) || this;
        }
        return SessionStorageStore;
    })(StorageApiWrapper));

//
    var cl = console.log;
    var DEFAULT_KEY_PREFIX = '_immortal|';
    var WINDOW_IS_DEFINED = (typeof window !== 'undefined');
// Stores must implement asynchronous constructor, get(), set(), and
// remove() methods.
    var DEFAULT_STORES = [CookieStore];
    try {
        if (WINDOW_IS_DEFINED && window.indexedDB) {
            DEFAULT_STORES.push(IndexedDbStore);
        }
    }
    catch (err) { }
    try {
        if (WINDOW_IS_DEFINED && window.localStorage) {
            DEFAULT_STORES.push(LocalStorageStore);
        }
    }
    catch (err) { }
    function arrayGet(arr, index, _default) {
        if (_default === void 0) { _default = null; }
        if (index in arr) {
            return arr[index];
        }
        return _default;
    }
    function countUniques(iterable) {
        // A Map must be used instead of an Object because JavaScript is a
        // buttshit language and all Object keys are serialized to strings.
        // Thus undefined becomes 'undefined', null becomes 'null', etc. Then,
        // in turn, 'undefined' can't be differentiated from undefined, null
        // from 'null', etc, and countUniques([null, 'null']) would
        // incorrectly return {'null': 2} instead of {null: 1, 'null': 1}.
        //
        // Unfortunately this Object behavior precludes the use of
        // lodash.countBy() and similar methods which count with Objects
        // instead of Maps.
        var m = new Map();
        var eles = iterable.slice();
        var _loop_1 = function (ele) {
            var count = 0;
            for (var _a = 0, eles_2 = eles; _a < eles_2.length; _a++) {
                var obj = eles_2[_a];
                if (ele === obj) {
                    count += 1;
                }
            }
            if (count > 0) {
                m.set(ele, count);
                eles = eles.filter(function (obj) { return obj !== ele; });
            }
        };
        for (var _i = 0, eles_1 = eles; _i < eles_1.length; _i++) {
            var ele = eles_1[_i];
            _loop_1(ele);
        }
        return m;
    }
    var ImmortalStorage = /** @class */ (function () {
        function ImmortalStorage(stores) {
            var _this = this;
            if (stores === void 0) { stores = DEFAULT_STORES; }
            this.stores = [];
            // Initialize stores asynchronously. Accept both instantiated store
            // objects and uninstantiated store classes. If the latter,
            // implicitly instantiate instances thereof in this constructor.
            //
            // This constructor must accept both instantiated store objects and
            // uninstantiated store classes because it's impossible to export
            // ImmortalStore if it only took store objects initialized
            // asynchronously. Like:
            //
            //   ;(async () => {
            //       const cookieStore = await CookieStore()
            //       const ImmortalDB = new ImmortalStorage([cookieStore])
            //       export { ImmortalDB }  // <----- Doesn't work.
            //   })
            //
            // So to export a synchronous ImmortalStorage class, datastore
            // classes (whose definitions are synchronous) must be accepted in
            // addition to instantiated store objects.
            this.onReady = (function () { return __awaiter$1(_this, void 0, void 0, function () {
                var _a;
                var _this = this;
                return __generator$1(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this;
                            return [4 /*yield*/, Promise.all(stores.map(function (StoreClassOrInstance) { return __awaiter$1(_this, void 0, void 0, function () {
                                return __generator$1(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(typeof StoreClassOrInstance === 'object')) return [3 /*break*/, 1];
                                            return [2 /*return*/, StoreClassOrInstance];
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, new StoreClassOrInstance()]; // Instantiate instance.
                                        case 2: return [2 /*return*/, _a.sent()]; // Instantiate instance.
                                        case 3:
                                            _a.sent();
                                            // TODO(grun): Log (where?) that the <Store> constructor Promise
                                            // failed.
                                            return [2 /*return*/, null];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                        case 1:
                            _a.stores = (_b.sent()).filter(Boolean);
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
        ImmortalStorage.prototype.get = function (key, _default) {
            if (_default === void 0) { _default = null; }
            return __awaiter$1(this, void 0, void 0, function () {
                var prefixedKey, values, counted, value, _a, firstValue, firstCount, _b, secondValue, secondCount;
                var _this = this;
                return __generator$1(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.onReady];
                        case 1:
                            _c.sent();
                            prefixedKey = "" + DEFAULT_KEY_PREFIX + key;
                            return [4 /*yield*/, Promise.all(this.stores.map(function (store) { return __awaiter$1(_this, void 0, void 0, function () {
                                var err_2;
                                return __generator$1(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, store.get(prefixedKey)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2:
                                            err_2 = _a.sent();
                                            cl(err_2);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                        case 2:
                            values = _c.sent();
                            counted = Array.from(countUniques(values).entries());
                            counted.sort(function (a, b) { return a[1] <= b[1]; });
                            _a = arrayGet(counted, 0, [undefined, 0]), firstValue = _a[0], firstCount = _a[1];
                            _b = arrayGet(counted, 1, [undefined, 0]), secondValue = _b[0], secondCount = _b[1];
                            if (firstCount > secondCount ||
                                (firstCount === secondCount && firstValue !== undefined)) {
                                value = firstValue;
                            }
                            else {
                                value = secondValue;
                            }
                            if (!(value !== undefined)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.set(key, value)];
                        case 3:
                            _c.sent();
                            return [2 /*return*/, value];
                        case 4: return [4 /*yield*/, this.remove(key)];
                        case 5:
                            _c.sent();
                            return [2 /*return*/, _default];
                    }
                });
            });
        };
        ImmortalStorage.prototype.set = function (key, value) {
            return __awaiter$1(this, void 0, void 0, function () {
                var _this = this;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.onReady];
                        case 1:
                            _a.sent();
                            key = "" + DEFAULT_KEY_PREFIX + key;
                            return [4 /*yield*/, Promise.all(this.stores.map(function (store) { return __awaiter$1(_this, void 0, void 0, function () {
                                var err_3;
                                return __generator$1(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, store.set(key, value)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_3 = _a.sent();
                                            cl(err_3);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, value];
                    }
                });
            });
        };
        ImmortalStorage.prototype.remove = function (key) {
            return __awaiter$1(this, void 0, void 0, function () {
                var _this = this;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.onReady];
                        case 1:
                            _a.sent();
                            key = "" + DEFAULT_KEY_PREFIX + key;
                            return [4 /*yield*/, Promise.all(this.stores.map(function (store) { return __awaiter$1(_this, void 0, void 0, function () {
                                var err_4;
                                return __generator$1(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, store.remove(key)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_4 = _a.sent();
                                            cl(err_4);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return ImmortalStorage;
    }());
    var ImmortalDB = new ImmortalStorage();

    var platform = createCommonjsModule(function (module, exports) {
        (function () {
            /** Used to determine if values are of the language type `Object`. */
            var objectTypes = {
                'function': true,
                'object': true
            };
            /** Used as a reference to the global object. */
            var root = objectTypes[typeof window] && window || this;
            /** Detect free variable `exports`. */
            var freeExports = exports;
            /** Detect free variable `module`. */
            var freeModule = module && !module.nodeType && module;
            /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
            var freeGlobal = freeExports && freeModule && typeof commonjsGlobal == 'object' && commonjsGlobal;
            if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
                root = freeGlobal;
            }
            /**
             * Used as the maximum length of an array-like object.
             * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
             * for more details.
             */
            var maxSafeInteger = Math.pow(2, 53) - 1;
            /** Regular expression to detect Opera. */
            var reOpera = /\bOpera/;
            /** Used for native method references. */
            var objectProto = Object.prototype;
            /** Used to check for own properties of an object. */
            var hasOwnProperty = objectProto.hasOwnProperty;
            /** Used to resolve the internal `[[Class]]` of values. */
            var toString = objectProto.toString;
            /*--------------------------------------------------------------------------*/
            /**
             * Capitalizes a string value.
             *
             * @private
             * @param {string} string The string to capitalize.
             * @returns {string} The capitalized string.
             */
            function capitalize(string) {
                string = String(string);
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
            /**
             * A utility function to clean up the OS name.
             *
             * @private
             * @param {string} os The OS name to clean up.
             * @param {string} [pattern] A `RegExp` pattern matching the OS name.
             * @param {string} [label] A label for the OS.
             */
            function cleanupOS(os, pattern, label) {
                // Platform tokens are defined at:
                // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
                // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
                var data = {
                    '10.0': '10',
                    '6.4': '10 Technical Preview',
                    '6.3': '8.1',
                    '6.2': '8',
                    '6.1': 'Server 2008 R2 / 7',
                    '6.0': 'Server 2008 / Vista',
                    '5.2': 'Server 2003 / XP 64-bit',
                    '5.1': 'XP',
                    '5.01': '2000 SP1',
                    '5.0': '2000',
                    '4.0': 'NT',
                    '4.90': 'ME'
                }; // Detect Windows version from platform tokens.
                if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) && (data = data[/[\d.]+$/.exec(os)])) {
                    os = 'Windows ' + data;
                } // Correct character case and cleanup string.
                os = String(os);
                if (pattern && label) {
                    os = os.replace(RegExp(pattern, 'i'), label);
                }
                os = format(os.replace(/ ce$/i, ' CE').replace(/\bhpw/i, 'web').replace(/\bMacintosh\b/, 'Mac OS').replace(/_PowerPC\b/i, ' OS').replace(/\b(OS X) [^ \d]+/i, '$1').replace(/\bMac (OS X)\b/, '$1').replace(/\/(\d)/, ' $1').replace(/_/g, '.').replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '').replace(/\bx86\.64\b/gi, 'x86_64').replace(/\b(Windows Phone) OS\b/, '$1').replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1').split(' on ')[0]);
                return os;
            }
            /**
             * An iteration utility for arrays and objects.
             *
             * @private
             * @param {Array|Object} object The object to iterate over.
             * @param {Function} callback The function called per iteration.
             */
            function each(object, callback) {
                var index = -1, length = function () {
                    if (object) {
                        return object.length;
                    }
                    return 0;
                }();
                if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
                    while (++index < length) {
                        callback(object[index], index, object);
                    }
                }
                else {
                    forOwn(object, callback);
                }
            }
            /**
             * Trim and conditionally capitalize string values.
             *
             * @private
             * @param {string} string The string to format.
             * @returns {string} The formatted string.
             */
            function format(string) {
                string = trim(string);
                return function () {
                    if (/^(?:webOS|i(?:OS|P))/.test(string)) {
                        return string;
                    }
                    return capitalize(string);
                }();
            }
            /**
             * Iterates over an object's own properties, executing the `callback` for each.
             *
             * @private
             * @param {Object} object The object to iterate over.
             * @param {Function} callback The function executed per own property.
             */
            function forOwn(object, callback) {
                for (var key in object) {
                    if (hasOwnProperty.call(object, key)) {
                        callback(object[key], key, object);
                    }
                }
            }
            /**
             * Gets the internal `[[Class]]` of a value.
             *
             * @private
             * @param {*} value The value.
             * @returns {string} The `[[Class]]`.
             */
            function getClassOf(value) {
                return function () {
                    if (value == null) {
                        return capitalize(value);
                    }
                    return toString.call(value).slice(8, -1);
                }();
            }
            /**
             * Host objects can return type values that are different from their actual
             * data type. The objects we are concerned with usually return non-primitive
             * types of "object", "function", or "unknown".
             *
             * @private
             * @param {*} object The owner of the property.
             * @param {string} property The property to check.
             * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
             */
            function isHostType(object, property) {
                var type = function () {
                    if (object != null) {
                        return typeof object[property];
                    }
                    return 'number';
                }();
                return !/^(?:boolean|number|string|undefined)$/.test(type) && function () {
                    if (type == 'object') {
                        return !!object[property];
                    }
                    return true;
                }();
            }
            /**
             * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
             *
             * @private
             * @param {string} string The string to qualify.
             * @returns {string} The qualified string.
             */
            function qualify(string) {
                return String(string).replace(/([ -])(?!$)/g, '$1?');
            }
            /**
             * A bare-bones `Array#reduce` like utility function.
             *
             * @private
             * @param {Array} array The array to iterate over.
             * @param {Function} callback The function called per iteration.
             * @returns {*} The accumulated result.
             */
            function reduce(array, callback) {
                var accumulator = null;
                each(array, function (value, index) {
                    accumulator = callback(accumulator, value, index, array);
                });
                return accumulator;
            }
            /**
             * Removes leading and trailing whitespace from a string.
             *
             * @private
             * @param {string} string The string to trim.
             * @returns {string} The trimmed string.
             */
            function trim(string) {
                return String(string).replace(/^ +| +$/g, '');
            }
            /*--------------------------------------------------------------------------*/
            /**
             * Creates a new platform object.
             *
             * @memberOf platform
             * @param {Object|string} [ua=navigator.userAgent] The user agent string or
             *  context object.
             * @returns {Object} A platform object.
             */
            function parse(ua) {
                /** The environment context object. */
                var context = root;
                /** Used to flag when a custom context is provided. */
                var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String'; // Juggle arguments.
                if (isCustomContext) {
                    context = ua;
                    ua = null;
                }
                /** Browser navigator object. */
                var nav = context.navigator || {};
                /** Browser user agent string. */
                var userAgent = nav.userAgent || '';
                ua || (ua = userAgent);
                /** Used to detect if browser is like Chrome. */
                var likeChrome = function () {
                    if (isCustomContext) {
                        return !!nav.likeChrome;
                    }
                    return /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());
                }();
                /** Internal `[[Class]]` value shortcuts. */
                var objectClass = 'Object', airRuntimeClass = function () {
                    if (isCustomContext) {
                        return objectClass;
                    }
                    return 'ScriptBridgingProxyObject';
                }(), enviroClass = function () {
                    if (isCustomContext) {
                        return objectClass;
                    }
                    return 'Environment';
                }(), javaClass = function () {
                    if (isCustomContext && context.java) {
                        return 'JavaPackage';
                    }
                    return getClassOf(context.java);
                }(), phantomClass = function () {
                    if (isCustomContext) {
                        return objectClass;
                    }
                    return 'RuntimeObject';
                }();
                /** Detect Java environments. */
                var java = /\bJava/.test(javaClass) && context.java;
                /** Detect Rhino. */
                var rhino = java && getClassOf(context.environment) == enviroClass;
                /** A character to represent alpha. */
                var alpha = function () {
                    if (java) {
                        return 'a';
                    }
                    return '\u03b1';
                }();
                /** A character to represent beta. */
                var beta = function () {
                    if (java) {
                        return 'b';
                    }
                    return '\u03b2';
                }();
                /** Browser document object. */
                var doc = context.document || {};
                /**
                 * Detect Opera browser (Presto-based).
                 * http://www.howtocreate.co.uk/operaStuff/operaObject.html
                 * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
                 */
                var opera = context.operamini || context.opera;
                /** Opera `[[Class]]`. */
                var operaClass = function () {
                    if (reOpera.test(operaClass = function () {
                        if (isCustomContext && opera) {
                            return opera['[[Class]]'];
                        }
                        return getClassOf(opera);
                    }())) {
                        return operaClass;
                    }
                    return opera = null;
                }();
                /*------------------------------------------------------------------------*/
                /** Temporary variable used over the script's lifetime. */
                var data;
                /** The CPU architecture. */
                var arch = ua;
                /** Platform description array. */
                var description = [];
                /** Platform alpha/beta indicator. */
                var prerelease = null;
                /** A flag to indicate that environment features should be used to resolve the platform. */
                var useFeatures = ua == userAgent;
                /** The browser/environment version. */
                var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();
                /** A flag to indicate if the OS ends with "/ Version" */
                var isSpecialCasedOS;
                /* Detectable layout engines (order is important). */
                var layout = getLayout([{
                    'label': 'EdgeHTML',
                    'pattern': 'Edge'
                }, 'Trident', {
                    'label': 'WebKit',
                    'pattern': 'AppleWebKit'
                }, 'iCab', 'Presto', 'NetFront', 'Tasman', 'KHTML', 'Gecko']);
                /* Detectable browser names (order is important). */
                var name = getName(['Adobe AIR', 'Arora', 'Avant Browser', 'Breach', 'Camino', 'Electron', 'Epiphany', 'Fennec', 'Flock', 'Galeon', 'GreenBrowser', 'iCab', 'Iceweasel', 'K-Meleon', 'Konqueror', 'Lunascape', 'Maxthon', {
                    'label': 'Microsoft Edge',
                    'pattern': '(?:Edge|Edg|EdgA|EdgiOS)'
                }, 'Midori', 'Nook Browser', 'PaleMoon', 'PhantomJS', 'Raven', 'Rekonq', 'RockMelt', {
                    'label': 'Samsung Internet',
                    'pattern': 'SamsungBrowser'
                }, 'SeaMonkey', {
                    'label': 'Silk',
                    'pattern': '(?:Cloud9|Silk-Accelerated)'
                }, 'Sleipnir', 'SlimBrowser', {
                    'label': 'SRWare Iron',
                    'pattern': 'Iron'
                }, 'Sunrise', 'Swiftfox', 'Vivaldi', 'Waterfox', 'WebPositive', {
                    'label': 'Yandex Browser',
                    'pattern': 'YaBrowser'
                }, {
                    'label': 'UC Browser',
                    'pattern': 'UCBrowser'
                }, 'Opera Mini', {
                    'label': 'Opera Mini',
                    'pattern': 'OPiOS'
                }, 'Opera', {
                    'label': 'Opera',
                    'pattern': 'OPR'
                }, 'Chromium', 'Chrome', {
                    'label': 'Chrome',
                    'pattern': '(?:HeadlessChrome)'
                }, {
                    'label': 'Chrome Mobile',
                    'pattern': '(?:CriOS|CrMo)'
                }, {
                    'label': 'Firefox',
                    'pattern': '(?:Firefox|Minefield)'
                }, {
                    'label': 'Firefox for iOS',
                    'pattern': 'FxiOS'
                }, {
                    'label': 'IE',
                    'pattern': 'IEMobile'
                }, {
                    'label': 'IE',
                    'pattern': 'MSIE'
                }, 'Safari']);
                /* Detectable products (order is important). */
                var product = getProduct([{
                    'label': 'BlackBerry',
                    'pattern': 'BB10'
                }, 'BlackBerry', {
                    'label': 'Galaxy S',
                    'pattern': 'GT-I9000'
                }, {
                    'label': 'Galaxy S2',
                    'pattern': 'GT-I9100'
                }, {
                    'label': 'Galaxy S3',
                    'pattern': 'GT-I9300'
                }, {
                    'label': 'Galaxy S4',
                    'pattern': 'GT-I9500'
                }, {
                    'label': 'Galaxy S5',
                    'pattern': 'SM-G900'
                }, {
                    'label': 'Galaxy S6',
                    'pattern': 'SM-G920'
                }, {
                    'label': 'Galaxy S6 Edge',
                    'pattern': 'SM-G925'
                }, {
                    'label': 'Galaxy S7',
                    'pattern': 'SM-G930'
                }, {
                    'label': 'Galaxy S7 Edge',
                    'pattern': 'SM-G935'
                }, 'Google TV', 'Lumia', 'iPad', 'iPod', 'iPhone', 'Kindle', {
                    'label': 'Kindle Fire',
                    'pattern': '(?:Cloud9|Silk-Accelerated)'
                }, 'Nexus', 'Nook', 'PlayBook', 'PlayStation Vita', 'PlayStation', 'TouchPad', 'Transformer', {
                    'label': 'Wii U',
                    'pattern': 'WiiU'
                }, 'Wii', 'Xbox One', {
                    'label': 'Xbox 360',
                    'pattern': 'Xbox'
                }, 'Xoom']);
                /* Detectable manufacturers. */
                var manufacturer = getManufacturer({
                    'Apple': {
                        'iPad': 1,
                        'iPhone': 1,
                        'iPod': 1
                    },
                    'Alcatel': {},
                    'Archos': {},
                    'Amazon': {
                        'Kindle': 1,
                        'Kindle Fire': 1
                    },
                    'Asus': {
                        'Transformer': 1
                    },
                    'Barnes & Noble': {
                        'Nook': 1
                    },
                    'BlackBerry': {
                        'PlayBook': 1
                    },
                    'Google': {
                        'Google TV': 1,
                        'Nexus': 1
                    },
                    'HP': {
                        'TouchPad': 1
                    },
                    'HTC': {},
                    'Huawei': {},
                    'Lenovo': {},
                    'LG': {},
                    'Microsoft': {
                        'Xbox': 1,
                        'Xbox One': 1
                    },
                    'Motorola': {
                        'Xoom': 1
                    },
                    'Nintendo': {
                        'Wii U': 1,
                        'Wii': 1
                    },
                    'Nokia': {
                        'Lumia': 1
                    },
                    'Oppo': {},
                    'Samsung': {
                        'Galaxy S': 1,
                        'Galaxy S2': 1,
                        'Galaxy S3': 1,
                        'Galaxy S4': 1
                    },
                    'Sony': {
                        'PlayStation': 1,
                        'PlayStation Vita': 1
                    },
                    'Xiaomi': {
                        'Mi': 1,
                        'Redmi': 1
                    }
                });
                /* Detectable operating systems (order is important). */
                var os = getOS(['Windows Phone', 'KaiOS', 'Android', 'CentOS', {
                    'label': 'Chrome OS',
                    'pattern': 'CrOS'
                }, 'Debian', {
                    'label': 'DragonFly BSD',
                    'pattern': 'DragonFly'
                }, 'Fedora', 'FreeBSD', 'Gentoo', 'Haiku', 'Kubuntu', 'Linux Mint', 'OpenBSD', 'Red Hat', 'SuSE', 'Ubuntu', 'Xubuntu', 'Cygwin', 'Symbian OS', 'hpwOS', 'webOS ', 'webOS', 'Tablet OS', 'Tizen', 'Linux', 'Mac OS X', 'Macintosh', 'Mac', 'Windows 98;', 'Windows ']);
                /*------------------------------------------------------------------------*/
                /**
                 * Picks the layout engine from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected layout engine.
                 */
                function getLayout(guesses) {
                    return reduce(guesses, function (result, guess) {
                        return result || RegExp('\\b' + (guess.pattern || qualify(guess)) + '\\b', 'i').exec(ua) && (guess.label || guess);
                    });
                }
                /**
                 * Picks the manufacturer from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An object of guesses.
                 * @returns {null|string} The detected manufacturer.
                 */
                function getManufacturer(guesses) {
                    return reduce(guesses, function (result, value, key) {
                        // Lookup the manufacturer by product or scan the UA for the manufacturer.
                        return result || (value[product] || value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] || RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)) && key;
                    });
                }
                /**
                 * Picks the browser name from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected browser name.
                 */
                function getName(guesses) {
                    return reduce(guesses, function (result, guess) {
                        return result || RegExp('\\b' + (guess.pattern || qualify(guess)) + '\\b', 'i').exec(ua) && (guess.label || guess);
                    });
                }
                /**
                 * Picks the OS name from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected OS name.
                 */
                function getOS(guesses) {
                    return reduce(guesses, function (result, guess) {
                        var pattern = guess.pattern || qualify(guess);
                        if (!result && (result = RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua))) {
                            result = cleanupOS(result, pattern, guess.label || guess);
                        }
                        return result;
                    });
                }
                /**
                 * Picks the product name from an array of guesses.
                 *
                 * @private
                 * @param {Array} guesses An array of guesses.
                 * @returns {null|string} The detected product name.
                 */
                function getProduct(guesses) {
                    return reduce(guesses, function (result, guess) {
                        var pattern = guess.pattern || qualify(guess);
                        if (!result && (result = RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) || RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) || RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua))) {
                            // Split by forward slash and append product version if needed.
                            if ((result = String(function () {
                                if (guess.label && !RegExp(pattern, 'i').test(guess.label)) {
                                    return guess.label;
                                }
                                return result;
                            }()).split('/'))[1] && !/[\d.]+/.test(result[0])) {
                                result[0] += ' ' + result[1];
                            } // Correct character case and cleanup string.
                            guess = guess.label || guess;
                            result = format(result[0].replace(RegExp(pattern, 'i'), guess).replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ').replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
                        }
                        return result;
                    });
                }
                /**
                 * Resolves the version using an array of UA patterns.
                 *
                 * @private
                 * @param {Array} patterns An array of UA patterns.
                 * @returns {null|string} The detected version.
                 */
                function getVersion(patterns) {
                    return reduce(patterns, function (result, pattern) {
                        return result || (RegExp(pattern + '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
                    });
                }
                /**
                 * Returns `platform.description` when the platform object is coerced to a string.
                 *
                 * @name toString
                 * @memberOf platform
                 * @returns {string} Returns `platform.description` if available, else an empty string.
                 */
                function toStringPlatform() {
                    return this.description || '';
                }
                /*------------------------------------------------------------------------*/
                // Convert layout to an array so we can add extra details.
                layout && (layout = [layout]); // Detect Android products.
                // Browsers on Android devices typically provide their product IDS after "Android;"
                // up to "Build" or ") AppleWebKit".
                // Example:
                // "Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5) Plus) AppleWebKit/537.36
                // (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36"
                if (/\bAndroid\b/.test(os) && !product && (data = /\bAndroid[^;]*;(.*?)(?:Build|\) AppleWebKit)\b/i.exec(ua))) {
                    product = trim(data[1]) // Replace any language codes (eg. "en-US").
                        .replace(/^[a-z]{2}-[a-z]{2};\s*/i, '') || null;
                } // Detect product names that contain their manufacturer's name.
                if (manufacturer && !product) {
                    product = getProduct([manufacturer]);
                }
                else if (manufacturer && product) {
                    product = product.replace(RegExp('^(' + qualify(manufacturer) + ')[-_.\\s]', 'i'), manufacturer + ' ').replace(RegExp('^(' + qualify(manufacturer) + ')[-_.]?(\\w)', 'i'), manufacturer + ' $2');
                } // Clean up Google TV.
                if (data = /\bGoogle TV\b/.exec(product)) {
                    product = data[0];
                } // Detect simulators.
                if (/\bSimulator\b/i.test(ua)) {
                    product = function () {
                        if (product) {
                            return product + ' ';
                        }
                        return '';
                    }() + 'Simulator';
                } // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
                if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
                    description.push('running in Turbo/Uncompressed mode');
                } // Detect IE Mobile 11.
                if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
                    data = parse(ua.replace(/like iPhone OS/, ''));
                    manufacturer = data.manufacturer;
                    product = data.product;
                } // Detect iOS.
                else if (/^iP/.test(product)) {
                    name || (name = 'Safari');
                    os = 'iOS' + function () {
                        if (data = / OS ([\d_]+)/i.exec(ua)) {
                            return ' ' + data[1].replace(/_/g, '.');
                        }
                        return '';
                    }();
                } // Detect Kubuntu.
                else if (name == 'Konqueror' && /^Linux\b/i.test(os)) {
                    os = 'Kubuntu';
                } // Detect Android browsers.
                else if (manufacturer && manufacturer != 'Google' && (/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua) || /\bVita\b/.test(product)) || /\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua)) {
                    name = 'Android Browser';
                    os = function () {
                        if (/\bAndroid\b/.test(os)) {
                            return os;
                        }
                        return 'Android';
                    }();
                } // Detect Silk desktop/accelerated modes.
                else if (name == 'Silk') {
                    if (!/\bMobi/i.test(ua)) {
                        os = 'Android';
                        description.unshift('desktop mode');
                    }
                    if (/Accelerated *= *true/i.test(ua)) {
                        description.unshift('accelerated');
                    }
                } // Detect UC Browser speed mode.
                else if (name == 'UC Browser' && /\bUCWEB\b/.test(ua)) {
                    description.push('speed mode');
                } // Detect PaleMoon identifying as Firefox.
                else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
                    description.push('identifying as Firefox ' + data[1]);
                } // Detect Firefox OS and products running Firefox.
                else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
                    os || (os = 'Firefox OS');
                    product || (product = data[1]);
                } // Detect false positives for Firefox/Safari.
                else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
                    // Escape the `/` for Firefox 1.
                    if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
                        // Clear name of false positives.
                        name = null;
                    } // Reassign a generic name.
                    if ((data = product || manufacturer || os) && (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
                        name = /[a-z]+(?: Hat)?/i.exec(function () {
                            if (/\bAndroid\b/.test(os)) {
                                return os;
                            }
                            return data;
                        }()) + ' Browser';
                    }
                } // Add Chrome version to description for Electron.
                else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
                    description.push('Chromium ' + data);
                } // Detect non-Opera (Presto-based) versions (order is important).
                if (!version) {
                    version = getVersion(['(?:Cloud9|CriOS|CrMo|Edge|Edg|EdgA|EdgiOS|FxiOS|HeadlessChrome|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$)|UCBrowser|YaBrowser)', 'Version', qualify(name), '(?:Firefox|Minefield|NetFront)']);
                } // Detect stubborn layout engines.
                if (data = layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' || /\bOpera\b/.test(name) && function () {
                    if (/\bOPR\b/.test(ua)) {
                        return 'Blink';
                    }
                    return 'Presto';
                }() || /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' || !layout && /\bMSIE\b/i.test(ua) && function () {
                    if (os == 'Mac OS') {
                        return 'Tasman';
                    }
                    return 'Trident';
                }() || layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront') {
                    layout = [data];
                } // Detect Windows Phone 7 desktop mode.
                if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
                    name += ' Mobile';
                    os = 'Windows Phone ' + function () {
                        if (/\+$/.test(data)) {
                            return data;
                        }
                        return data + '.x';
                    }();
                    description.unshift('desktop mode');
                } // Detect Windows Phone 8.x desktop mode.
                else if (/\bWPDesktop\b/i.test(ua)) {
                    name = 'IE Mobile';
                    os = 'Windows Phone 8.x';
                    description.unshift('desktop mode');
                    version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
                } // Detect IE 11 identifying as other browsers.
                else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
                    if (name) {
                        description.push('identifying as ' + name + function () {
                            if (version) {
                                return ' ' + version;
                            }
                            return '';
                        }());
                    }
                    name = 'IE';
                    version = data[1];
                } // Leverage environment features.
                if (useFeatures) {
                    // Detect server-side environments.
                    // Rhino has a global function while others have a global object.
                    if (isHostType(context, 'global')) {
                        if (java) {
                            data = java.lang.System;
                            arch = data.getProperty('os.arch');
                            os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
                        }
                        if (rhino) {
                            try {
                                version = context.require('ringo/engine').version.join('.');
                                name = 'RingoJS';
                            }
                            catch (e) {
                                if ((data = context.system) && data.global.system == context.system) {
                                    name = 'Narwhal';
                                    os || (os = data[0].os || null);
                                }
                            }
                            if (!name) {
                                name = 'Rhino';
                            }
                        }
                        else if (typeof context.process == 'object' && !context.process.browser && (data = context.process)) {
                            if (typeof data.versions == 'object') {
                                if (typeof data.versions.electron == 'string') {
                                    description.push('Node ' + data.versions.node);
                                    name = 'Electron';
                                    version = data.versions.electron;
                                }
                                else if (typeof data.versions.nw == 'string') {
                                    description.push('Chromium ' + version, 'Node ' + data.versions.node);
                                    name = 'NW.js';
                                    version = data.versions.nw;
                                }
                            }
                            if (!name) {
                                name = 'Node.js';
                                arch = data.arch;
                                os = data.platform;
                                version = /[\d.]+/.exec(data.version);
                                version = function () {
                                    if (version) {
                                        return version[0];
                                    }
                                    return null;
                                }();
                            }
                        }
                    } // Detect Adobe AIR.
                    else if (getClassOf(data = context.runtime) == airRuntimeClass) {
                        name = 'Adobe AIR';
                        os = data.flash.system.Capabilities.os;
                    } // Detect PhantomJS.
                    else if (getClassOf(data = context.phantom) == phantomClass) {
                        name = 'PhantomJS';
                        version = (data = data.version || null) && data.major + '.' + data.minor + '.' + data.patch;
                    } // Detect IE compatibility modes.
                    else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
                        // We're in compatibility mode when the Trident version + 4 doesn't
                        // equal the document mode.
                        version = [version, doc.documentMode];
                        if ((data = +data[1] + 4) != version[1]) {
                            description.push('IE ' + version[1] + ' mode');
                            layout && (layout[1] = '');
                            version[1] = data;
                        }
                        version = function () {
                            if (name == 'IE') {
                                return String(version[1].toFixed(1));
                            }
                            return version[0];
                        }();
                    } // Detect IE 11 masking as other browsers.
                    else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
                        description.push('masking as ' + name + ' ' + version);
                        name = 'IE';
                        version = '11.0';
                        layout = ['Trident'];
                        os = 'Windows';
                    }
                    os = os && format(os);
                } // Detect prerelease phases.
                if (version && (data = /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) || /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) || /\bMinefield\b/i.test(ua) && 'a')) {
                    prerelease = function () {
                        if (/b/i.test(data)) {
                            return 'beta';
                        }
                        return 'alpha';
                    }();
                    version = version.replace(RegExp(data + '\\+?$'), '') + function () {
                        if (prerelease == 'beta') {
                            return beta;
                        }
                        return alpha;
                    }() + (/\d+\+?/.exec(data) || '');
                } // Detect Firefox Mobile.
                if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS|KaiOS)\b/.test(os)) {
                    name = 'Firefox Mobile';
                } // Obscure Maxthon's unreliable version.
                else if (name == 'Maxthon' && version) {
                    version = version.replace(/\.[\d.]+/, '.x');
                } // Detect Xbox 360 and Xbox One.
                else if (/\bXbox\b/i.test(product)) {
                    if (product == 'Xbox 360') {
                        os = null;
                    }
                    if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
                        description.unshift('mobile mode');
                    }
                } // Add mobile postfix.
                else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) && (os == 'Windows CE' || /Mobi/i.test(ua))) {
                    name += ' Mobile';
                } // Detect IE platform preview.
                else if (name == 'IE' && useFeatures) {
                    try {
                        if (context.external === null) {
                            description.unshift('platform preview');
                        }
                    }
                    catch (e) {
                        description.unshift('embedded');
                    }
                } // Detect BlackBerry OS version.
                // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
                else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data = (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] || version)) {
                    data = [data, /BB10/.test(ua)];
                    os = function () {
                        if (data[1]) {
                            return product = null, manufacturer = 'BlackBerry';
                        }
                        return 'Device Software';
                    }() + ' ' + data[0];
                    version = null;
                } // Detect Opera identifying/masking itself as another browser.
                // http://www.opera.com/support/kb/view/843/
                else if (this != forOwn && product != 'Wii' && (useFeatures && opera || /Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua) || name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os) || name == 'IE' && (os && !/^Win/.test(os) && version > 5.5 || /\bWindows XP\b/.test(os) && version > 8 || version == 8 && !/\bTrident\b/.test(ua))) && !reOpera.test(data = parse.call(forOwn, ua.replace(reOpera, '') + ';')) && data.name) {
                    // When "identifying", the UA contains both Opera and the other browser's name.
                    data = 'ing as ' + data.name + function () {
                        if (data = data.version) {
                            return ' ' + data;
                        }
                        return '';
                    }();
                    if (reOpera.test(name)) {
                        if (/\bIE\b/.test(data) && os == 'Mac OS') {
                            os = null;
                        }
                        data = 'identify' + data;
                    } // When "masking", the UA contains only the other browser's name.
                    else {
                        data = 'mask' + data;
                        if (operaClass) {
                            name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
                        }
                        else {
                            name = 'Opera';
                        }
                        if (/\bIE\b/.test(data)) {
                            os = null;
                        }
                        if (!useFeatures) {
                            version = null;
                        }
                    }
                    layout = ['Presto'];
                    description.push(data);
                } // Detect WebKit Nightly and approximate Chrome/Safari versions.
                if (data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1]) {
                    // Correct build number for numeric comparison.
                    // (e.g. "532.5" becomes "532.05")
                    data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data]; // Nightly builds are postfixed with a "+".
                    if (name == 'Safari' && data[1].slice(-1) == '+') {
                        name = 'WebKit Nightly';
                        prerelease = 'alpha';
                        version = data[1].slice(0, -1);
                    } // Clear incorrect browser versions.
                    else if (version == data[1] || version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
                        version = null;
                    } // Use the full Chrome version when available.
                    data[1] = (/\b(?:Headless)?Chrome\/([\d.]+)/i.exec(ua) || 0)[1]; // Detect Blink layout engine.
                    if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
                        layout = ['Blink'];
                    } // Detect JavaScriptCore.
                    // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
                    if (!useFeatures || !likeChrome && !data[1]) {
                        layout && (layout[1] = 'like Safari');
                        data = (data = data[0], function () {
                            if (data < 400) {
                                return 1;
                            }
                            return function () {
                                if (data < 500) {
                                    return 2;
                                }
                                return function () {
                                    if (data < 526) {
                                        return 3;
                                    }
                                    return function () {
                                        if (data < 533) {
                                            return 4;
                                        }
                                        return function () {
                                            if (data < 534) {
                                                return '4+';
                                            }
                                            return function () {
                                                if (data < 535) {
                                                    return 5;
                                                }
                                                return function () {
                                                    if (data < 537) {
                                                        return 6;
                                                    }
                                                    return function () {
                                                        if (data < 538) {
                                                            return 7;
                                                        }
                                                        return function () {
                                                            if (data < 601) {
                                                                return 8;
                                                            }
                                                            return function () {
                                                                if (data < 602) {
                                                                    return 9;
                                                                }
                                                                return function () {
                                                                    if (data < 604) {
                                                                        return 10;
                                                                    }
                                                                    return function () {
                                                                        if (data < 606) {
                                                                            return 11;
                                                                        }
                                                                        return function () {
                                                                            if (data < 608) {
                                                                                return 12;
                                                                            }
                                                                            return '12';
                                                                        }();
                                                                    }();
                                                                }();
                                                            }();
                                                        }();
                                                    }();
                                                }();
                                            }();
                                        }();
                                    }();
                                }();
                            }();
                        }());
                    }
                    else {
                        layout && (layout[1] = 'like Chrome');
                        data = data[1] || (data = data[0], function () {
                            if (data < 530) {
                                return 1;
                            }
                            return function () {
                                if (data < 532) {
                                    return 2;
                                }
                                return function () {
                                    if (data < 532.05) {
                                        return 3;
                                    }
                                    return function () {
                                        if (data < 533) {
                                            return 4;
                                        }
                                        return function () {
                                            if (data < 534.03) {
                                                return 5;
                                            }
                                            return function () {
                                                if (data < 534.07) {
                                                    return 6;
                                                }
                                                return function () {
                                                    if (data < 534.10) {
                                                        return 7;
                                                    }
                                                    return function () {
                                                        if (data < 534.13) {
                                                            return 8;
                                                        }
                                                        return function () {
                                                            if (data < 534.16) {
                                                                return 9;
                                                            }
                                                            return function () {
                                                                if (data < 534.24) {
                                                                    return 10;
                                                                }
                                                                return function () {
                                                                    if (data < 534.30) {
                                                                        return 11;
                                                                    }
                                                                    return function () {
                                                                        if (data < 535.01) {
                                                                            return 12;
                                                                        }
                                                                        return function () {
                                                                            if (data < 535.02) {
                                                                                return '13+';
                                                                            }
                                                                            return function () {
                                                                                if (data < 535.07) {
                                                                                    return 15;
                                                                                }
                                                                                return function () {
                                                                                    if (data < 535.11) {
                                                                                        return 16;
                                                                                    }
                                                                                    return function () {
                                                                                        if (data < 535.19) {
                                                                                            return 17;
                                                                                        }
                                                                                        return function () {
                                                                                            if (data < 536.05) {
                                                                                                return 18;
                                                                                            }
                                                                                            return function () {
                                                                                                if (data < 536.10) {
                                                                                                    return 19;
                                                                                                }
                                                                                                return function () {
                                                                                                    if (data < 537.01) {
                                                                                                        return 20;
                                                                                                    }
                                                                                                    return function () {
                                                                                                        if (data < 537.11) {
                                                                                                            return '21+';
                                                                                                        }
                                                                                                        return function () {
                                                                                                            if (data < 537.13) {
                                                                                                                return 23;
                                                                                                            }
                                                                                                            return function () {
                                                                                                                if (data < 537.18) {
                                                                                                                    return 24;
                                                                                                                }
                                                                                                                return function () {
                                                                                                                    if (data < 537.24) {
                                                                                                                        return 25;
                                                                                                                    }
                                                                                                                    return function () {
                                                                                                                        if (data < 537.36) {
                                                                                                                            return 26;
                                                                                                                        }
                                                                                                                        return function () {
                                                                                                                            if (layout != 'Blink') {
                                                                                                                                return '27';
                                                                                                                            }
                                                                                                                            return '28';
                                                                                                                        }();
                                                                                                                    }();
                                                                                                                }();
                                                                                                            }();
                                                                                                        }();
                                                                                                    }();
                                                                                                }();
                                                                                            }();
                                                                                        }();
                                                                                    }();
                                                                                }();
                                                                            }();
                                                                        }();
                                                                    }();
                                                                }();
                                                            }();
                                                        }();
                                                    }();
                                                }();
                                            }();
                                        }();
                                    }();
                                }();
                            }();
                        }());
                    } // Add the postfix of ".x" or "+" for approximate versions.
                    layout && (layout[1] += ' ' + (data += function () {
                        if (typeof data == 'number') {
                            return '.x';
                        }
                        return function () {
                            if (/[.+]/.test(data)) {
                                return '';
                            }
                            return '+';
                        }();
                    }())); // Obscure version for some Safari 1-2 releases.
                    if (name == 'Safari' && (!version || parseInt(version) > 45)) {
                        version = data;
                    }
                    else if (name == 'Chrome' && /\bHeadlessChrome/i.test(ua)) {
                        description.unshift('headless');
                    }
                } // Detect Opera desktop modes.
                if (name == 'Opera' && (data = /\bzbov|zvav$/.exec(os))) {
                    name += ' ';
                    description.unshift('desktop mode');
                    if (data == 'zvav') {
                        name += 'Mini';
                        version = null;
                    }
                    else {
                        name += 'Mobile';
                    }
                    os = os.replace(RegExp(' *' + data + '$'), '');
                } // Detect Chrome desktop mode.
                else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
                    description.unshift('desktop mode');
                    name = 'Chrome Mobile';
                    version = null;
                    if (/\bOS X\b/.test(os)) {
                        manufacturer = 'Apple';
                        os = 'iOS 4.3+';
                    }
                    else {
                        os = null;
                    }
                } // Newer versions of SRWare Iron uses the Chrome tag to indicate its version number.
                else if (/\bSRWare Iron\b/.test(name) && !version) {
                    version = getVersion('Chrome');
                } // Strip incorrect OS versions.
                if (version && version.indexOf(data = /[\d.]+$/.exec(os)) == 0 && ua.indexOf('/' + data + '-') > -1) {
                    os = trim(os.replace(data, ''));
                } // Ensure OS does not include the browser name.
                if (os && os.indexOf(name) != -1 && !RegExp(name + ' OS').test(os)) {
                    os = os.replace(RegExp(' *' + qualify(name) + ' *'), '');
                } // Add layout engine.
                if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (/Browser|Lunascape|Maxthon/.test(name) || name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) || /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|SRWare Iron|Vivaldi|Web)/.test(name) && layout[1])) {
                    // Don't add layout details to description if they are falsey.
                    (data = layout[layout.length - 1]) && description.push(data);
                } // Combine contextual information.
                if (description.length) {
                    description = ['(' + description.join('; ') + ')'];
                } // Append manufacturer to description.
                if (manufacturer && product && product.indexOf(manufacturer) < 0) {
                    description.push('on ' + manufacturer);
                } // Append product to description.
                if (product) {
                    description.push(function () {
                        if (/^on /.test(description[description.length - 1])) {
                            return '';
                        }
                        return 'on ';
                    }() + product);
                } // Parse the OS into an object.
                if (os) {
                    data = / ([\d.+]+)$/.exec(os);
                    isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
                    os = {
                        'architecture': 32,
                        'family': function () {
                            if (data && !isSpecialCasedOS) {
                                return os.replace(data[0], '');
                            }
                            return os;
                        }(),
                        'version': function () {
                            if (data) {
                                return data[1];
                            }
                            return null;
                        }(),
                        'toString': function () {
                            var version = this.version;
                            var t = this;
                            return this.family + function () {
                                if (version && !isSpecialCasedOS) {
                                    return ' ' + version;
                                }
                                return '';
                            }() + function () {
                                if (t.architecture == 64) {
                                    return ' 64-bit';
                                }
                                return '';
                            }();
                        }
                    };
                } // Add browser/OS architecture.
                if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
                    if (os) {
                        os.architecture = 64;
                        os.family = os.family.replace(RegExp(' *' + data), '');
                    }
                    if (name && (/\bWOW64\b/i.test(ua) || useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua))) {
                        description.unshift('32-bit');
                    }
                } // Chrome 39 and above on OS X is always 64-bit.
                else if (os && /^OS X/.test(os.family) && name == 'Chrome' && parseFloat(version) >= 39) {
                    os.architecture = 64;
                }
                ua || (ua = null);
                /*------------------------------------------------------------------------*/
                /**
                 * The platform object.
                 *
                 * @name platform
                 * @type Object
                 */
                var platform = {};
                /**
                 * The platform description.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.description = ua;
                /**
                 * The name of the browser's layout engine.
                 *
                 * The list of common layout engines include:
                 * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.layout = layout && layout[0];
                /**
                 * The name of the product's manufacturer.
                 *
                 * The list of manufacturers include:
                 * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
                 * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
                 * "Nokia", "Samsung" and "Sony"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.manufacturer = manufacturer;
                /**
                 * The name of the browser/environment.
                 *
                 * The list of common browser names include:
                 * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
                 * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
                 * "Opera Mini" and "Opera"
                 *
                 * Mobile versions of some browsers have "Mobile" appended to their name:
                 * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.name = name;
                /**
                 * The alpha/beta release indicator.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.prerelease = prerelease;
                /**
                 * The name of the product hosting the browser.
                 *
                 * The list of common products include:
                 *
                 * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
                 * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.product = product;
                /**
                 * The browser's user agent string.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.ua = ua;
                /**
                 * The browser/environment version.
                 *
                 * @memberOf platform
                 * @type string|null
                 */
                platform.version = name && version;
                /**
                 * The name of the operating system.
                 *
                 * @memberOf platform
                 * @type Object
                 */
                platform.os = os || {
                    /**
                     * The CPU architecture the OS is built for.
                     *
                     * @memberOf platform.os
                     * @type number|null
                     */
                    'architecture': null,
                    /**
                     * The family of the OS.
                     *
                     * Common values include:
                     * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
                     * "Windows XP", "OS X", "Linux", "Ubuntu", "Debian", "Fedora", "Red Hat",
                     * "SuSE", "Android", "iOS" and "Windows Phone"
                     *
                     * @memberOf platform.os
                     * @type string|null
                     */
                    'family': null,
                    /**
                     * The version of the OS.
                     *
                     * @memberOf platform.os
                     * @type string|null
                     */
                    'version': null,
                    /**
                     * Returns the OS string.
                     *
                     * @memberOf platform.os
                     * @returns {string} The OS string.
                     */
                    'toString': function () {
                        return 'null';
                    }
                };
                platform.parse = parse;
                platform.toString = toStringPlatform;
                if (platform.version) {
                    description.unshift(version);
                }
                if (platform.name) {
                    description.unshift(name);
                }
                if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
                    description.push(function () {
                        if (product) {
                            return '(' + os + ')';
                        }
                        return 'on ' + os;
                    }());
                }
                if (description.length) {
                    platform.description = description.join(' ');
                }
                return platform;
            }
            /*--------------------------------------------------------------------------*/
            // Export platform.
            var platform = parse(); // Some AMD build optimizers, like r.js, check for condition patterns like the following:
            if (freeExports && freeModule) {
                // Export for CommonJS support.
                forOwn(platform, function (value, key) {
                    freeExports[key] = value;
                });
            }
            else {
                // Export to the global object.
                root.platform = platform;
            }
        }).call(commonjsGlobal);
    });

    var getCollectedInfo = function () {
        return {
            deviceType: getDeviceType(),
            model: platform.product,
            os: platform.os.toString(),
            architecture: platform.os.architecture,
            browser: platform.name,
            browserBuildNumber: platform.version,
            languages: navigator.languages.toString(),
            time: new Date().toString(),
            videoCardInfo: getVideoCardInfo(),
            coreNumbers: navigator.hardwareConcurrency,
            ramMemory: navigator.deviceMemory,
            pointingMethod: checkDevicePointingMethod(),
            userAgent: platform.ua,
            orientation: getOrientation(),
            resolution: getResolution(),
            devicePixelRatio: window.devicePixelRatio,
            colorDepth: window.screen.colorDepth
        };
    };
    var getDeviceType = function () {
        var ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        }
        if (/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "mobile";
        }
        return "desktop";
    };
    var getVideoCardInfo = function () {
        var gl = document.createElement('canvas').getContext('webgl');
        if (!gl) {
            return "no webgl";
        }
        var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return function () {
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            return "no WEBGL_debug_renderer_info";
        }();
    };
    var checkDevicePointingMethod = function () {
        if ('ontouchstart' in document.documentElement) {
            return 'touch';
        }
        else {
            return 'mouse';
        }
    };
    var getOrientation = function () {
        return function () {
            if (window.innerWidth > window.innerHeight) {
                return "Landscape";
            }
            return "Portrait";
        }();
    };
    var getResolution = function () {
        return window.screen.availHeight + " X " + window.screen.availWidth;
    };

    var global$1 = typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof global$1 !== 'undefined' && global$1;
    var support = {
        searchParams: 'URLSearchParams' in global$1,
        iterable: 'Symbol' in global$1 && 'iterator' in Symbol,
        blob: 'FileReader' in global$1 && 'Blob' in global$1 && function () {
            try {
                new Blob();
                return true;
            }
            catch (e) {
                return false;
            }
        }(),
        formData: 'FormData' in global$1,
        arrayBuffer: 'ArrayBuffer' in global$1
    };
    function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj);
    }
    if (support.arrayBuffer) {
        var viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];
        var isArrayBufferView = ArrayBuffer.isView || function (obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
        };
    }
    function normalizeName(name) {
        if (typeof name !== 'string') {
            name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
            throw new TypeError('Invalid character in header field name: "' + name + '"');
        }
        return name.toLowerCase();
    }
    function normalizeValue(value) {
        if (typeof value !== 'string') {
            value = String(value);
        }
        return value;
    } // Build a destructive iterator for the value list
    function iteratorFor(items) {
        var iterator = {
            next: function () {
                var value = items.shift();
                return {
                    done: value === undefined,
                    value: value
                };
            }
        };
        if (support.iterable) {
            iterator[Symbol.iterator] = function () {
                return iterator;
            };
        }
        return iterator;
    }
    function Headers(headers) {
        this.map = {};
        if (headers instanceof Headers) {
            headers.forEach(function (value, name) {
                this.append(name, value);
            }, this);
        }
        else if (Array.isArray(headers)) {
            headers.forEach(function (header) {
                this.append(header[0], header[1]);
            }, this);
        }
        else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function (name) {
                this.append(name, headers[name]);
            }, this);
        }
    }
    Headers.prototype.append = function (name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = function () {
            if (oldValue) {
                return oldValue + ', ' + value;
            }
            return value;
        }();
    };
    Headers.prototype['delete'] = function (name) {
        delete this.map[normalizeName(name)];
    };
    Headers.prototype.get = function (name) {
        name = normalizeName(name);
        return function () {
            if (this.has(name)) {
                return this.map[name];
            }
            return null;
        }();
    };
    Headers.prototype.has = function (name) {
        return this.map.hasOwnProperty(normalizeName(name));
    };
    Headers.prototype.set = function (name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
    };
    Headers.prototype.forEach = function (callback, thisArg) {
        for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
                callback.call(thisArg, this.map[name], name, this);
            }
        }
    };
    Headers.prototype.keys = function () {
        var items = [];
        this.forEach(function (value, name) {
            items.push(name);
        });
        return iteratorFor(items);
    };
    Headers.prototype.values = function () {
        var items = [];
        this.forEach(function (value) {
            items.push(value);
        });
        return iteratorFor(items);
    };
    Headers.prototype.entries = function () {
        var items = [];
        this.forEach(function (value, name) {
            items.push([name, value]);
        });
        return iteratorFor(items);
    };
    if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    }
    function consumed(body) {
        if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'));
        }
        body.bodyUsed = true;
    }
    function fileReaderReady(reader) {
        return new Promise(function (resolve, reject) {
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function () {
                reject(reader.error);
            };
        });
    }
    function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise;
    }
    function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise;
    }
    function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);
        for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join('');
    }
    function bufferClone(buf) {
        if (buf.slice) {
            return buf.slice(0);
        }
        else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
        }
    }
    function Body() {
        this.bodyUsed = false;
        this._initBody = function (body) {
            /*
          fetch-mock wraps the Response object in an ES6 Proxy to
          provide useful test harness features such as flush. However, on
          ES5 browsers without fetch or Proxy support pollyfills must be used;
          the proxy-pollyfill is unable to proxy an attribute unless it exists
          on the object before the Proxy is created. This change ensures
          Response.bodyUsed exists on the instance, while maintaining the
          semantic of setting Request.bodyUsed in the constructor before
          _initBody is called.
        */
            this.bodyUsed = this.bodyUsed;
            this._bodyInit = body;
            if (!body) {
                this._bodyText = '';
            }
            else if (typeof body === 'string') {
                this._bodyText = body;
            }
            else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
                this._bodyBlob = body;
            }
            else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
                this._bodyFormData = body;
            }
            else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this._bodyText = body.toString();
            }
            else if (support.arrayBuffer && support.blob && isDataView(body)) {
                this._bodyArrayBuffer = bufferClone(body.buffer); // IE 10-11 can't handle a DataView body.
                this._bodyInit = new Blob([this._bodyArrayBuffer]);
            }
            else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
                this._bodyArrayBuffer = bufferClone(body);
            }
            else {
                this._bodyText = body = Object.prototype.toString.call(body);
            }
            if (!this.headers.get('content-type')) {
                if (typeof body === 'string') {
                    this.headers.set('content-type', 'text/plain;charset=UTF-8');
                }
                else if (this._bodyBlob && this._bodyBlob.type) {
                    this.headers.set('content-type', this._bodyBlob.type);
                }
                else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                    this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
                }
            }
        };
        if (support.blob) {
            this.blob = function () {
                var rejected = consumed(this);
                if (rejected) {
                    return rejected;
                }
                if (this._bodyBlob) {
                    return Promise.resolve(this._bodyBlob);
                }
                else if (this._bodyArrayBuffer) {
                    return Promise.resolve(new Blob([this._bodyArrayBuffer]));
                }
                else if (this._bodyFormData) {
                    throw new Error('could not read FormData body as blob');
                }
                else {
                    return Promise.resolve(new Blob([this._bodyText]));
                }
            };
            this.arrayBuffer = function () {
                if (this._bodyArrayBuffer) {
                    var isConsumed = consumed(this);
                    if (isConsumed) {
                        return isConsumed;
                    }
                    if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                        return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
                    }
                    else {
                        return Promise.resolve(this._bodyArrayBuffer);
                    }
                }
                else {
                    return this.blob().then(readBlobAsArrayBuffer);
                }
            };
        }
        this.text = function () {
            var rejected = consumed(this);
            if (rejected) {
                return rejected;
            }
            if (this._bodyBlob) {
                return readBlobAsText(this._bodyBlob);
            }
            else if (this._bodyArrayBuffer) {
                return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            }
            else if (this._bodyFormData) {
                throw new Error('could not read FormData body as text');
            }
            else {
                return Promise.resolve(this._bodyText);
            }
        };
        if (support.formData) {
            this.formData = function () {
                return this.text().then(decode);
            };
        }
        this.json = function () {
            return this.text().then(JSON.parse);
        };
        return this;
    } // HTTP methods whose capitalization should be normalized
    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
    function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return function () {
            if (methods.indexOf(upcased) > -1) {
                return upcased;
            }
            return method;
        }();
    }
    function Request(input, options) {
        if (!(this instanceof Request)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
        }
        options = options || {};
        var body = options.body;
        if (input instanceof Request) {
            if (input.bodyUsed) {
                throw new TypeError('Already read');
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
                this.headers = new Headers(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;
            if (!body && input._bodyInit != null) {
                body = input._bodyInit;
                input.bodyUsed = true;
            }
        }
        else {
            this.url = String(input);
        }
        this.credentials = options.credentials || this.credentials || 'same-origin';
        if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal;
        this.referrer = null;
        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests');
        }
        this._initBody(body);
        if (this.method === 'GET' || this.method === 'HEAD') {
            if (options.cache === 'no-store' || options.cache === 'no-cache') {
                // Search for a '_' parameter in the query string
                var reParamSearch = /([?&])_=[^&]*/;
                if (reParamSearch.test(this.url)) {
                    // If it already exists then set the value with the current time
                    this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
                }
                else {
                    // Otherwise add a new '_' parameter to the end with the current time
                    var reQueryString = /\?/;
                    this.url += function () {
                        if (reQueryString.test(this.url)) {
                            return '&';
                        }
                        return '?';
                    }() + '_=' + new Date().getTime();
                }
            }
        }
    }
    Request.prototype.clone = function () {
        return new Request(this, {
            body: this._bodyInit
        });
    };
    function decode(body) {
        var form = new FormData();
        body.trim().split('&').forEach(function (bytes) {
            if (bytes) {
                var split = bytes.split('=');
                var name = split.shift().replace(/\+/g, ' ');
                var value = split.join('=').replace(/\+/g, ' ');
                form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
        });
        return form;
    }
    function parseHeaders(rawHeaders) {
        var headers = new Headers(); // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' '); // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
        // https://github.com/github/fetch/issues/748
        // https://github.com/zloirock/core-js/issues/751
        preProcessedHeaders.split('\r').map(function (header) {
            return function () {
                if (header.indexOf('\n') === 0) {
                    return header.substr(1, header.length);
                }
                return header;
            }();
        }).forEach(function (line) {
            var parts = line.split(':');
            var key = parts.shift().trim();
            if (key) {
                var value = parts.join(':').trim();
                headers.append(key, value);
            }
        });
        return headers;
    }
    Body.call(Request.prototype);
    function Response(bodyInit, options) {
        if (!(this instanceof Response)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
        }
        if (!options) {
            options = {};
        }
        this.type = 'default';
        this.status = function () {
            if (options.status === undefined) {
                return 200;
            }
            return options.status;
        }();
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = function () {
            if (options.statusText === undefined) {
                return '';
            }
            return '' + options.statusText;
        }();
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
    }
    Body.call(Response.prototype);
    Response.prototype.clone = function () {
        return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
        });
    };
    Response.error = function () {
        var response = new Response(null, {
            status: 0,
            statusText: ''
        });
        response.type = 'error';
        return response;
    };
    var redirectStatuses = [301, 302, 303, 307, 308];
    Response.redirect = function (url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code');
        }
        return new Response(null, {
            status: status,
            headers: {
                location: url
            }
        });
    };
    var DOMException = global$1.DOMException;
    try {
        new DOMException();
    }
    catch (err) {
        DOMException = function (message, name) {
            this.message = message;
            this.name = name;
            var error = Error(message);
            this.stack = error.stack;
        };
        DOMException.prototype = Object.create(Error.prototype);
        DOMException.prototype.constructor = DOMException;
    }
    function fetch$1(input, init) {
        return new Promise(function (resolve, reject) {
            var request = new Request(input, init);
            if (request.signal && request.signal.aborted) {
                return reject(new DOMException('Aborted', 'AbortError'));
            }
            var xhr = new XMLHttpRequest();
            function abortXhr() {
                xhr.abort();
            }
            xhr.onload = function () {
                var options = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: parseHeaders(xhr.getAllResponseHeaders() || '')
                };
                options.url = function () {
                    if ('responseURL' in xhr) {
                        return xhr.responseURL;
                    }
                    return options.headers.get('X-Request-URL');
                }();
                var body = function () {
                    if ('response' in xhr) {
                        return xhr.response;
                    }
                    return xhr.responseText;
                }();
                setTimeout(function () {
                    resolve(new Response(body, options));
                }, 0);
            };
            xhr.onerror = function () {
                setTimeout(function () {
                    reject(new TypeError('Network request failed'));
                }, 0);
            };
            xhr.ontimeout = function () {
                setTimeout(function () {
                    reject(new TypeError('Network request failed'));
                }, 0);
            };
            xhr.onabort = function () {
                setTimeout(function () {
                    reject(new DOMException('Aborted', 'AbortError'));
                }, 0);
            };
            function fixUrl(url) {
                try {
                    return function () {
                        if (url === '' && global$1.location.href) {
                            return global$1.location.href;
                        }
                        return url;
                    }();
                }
                catch (e) {
                    return url;
                }
            }
            xhr.open(request.method, fixUrl(request.url), true);
            if (request.credentials === 'include') {
                xhr.withCredentials = true;
            }
            else if (request.credentials === 'omit') {
                xhr.withCredentials = false;
            }
            if ('responseType' in xhr) {
                if (support.blob) {
                    xhr.responseType = 'blob';
                }
                else if (support.arrayBuffer && request.headers.get('Content-Type') && request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1) {
                    xhr.responseType = 'arraybuffer';
                }
            }
            if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
                Object.getOwnPropertyNames(init.headers).forEach(function (name) {
                    xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
                });
            }
            else {
                request.headers.forEach(function (value, name) {
                    xhr.setRequestHeader(name, value);
                });
            }
            if (request.signal) {
                request.signal.addEventListener('abort', abortXhr);
                xhr.onreadystatechange = function () {
                    // DONE (success or failure)
                    if (xhr.readyState === 4) {
                        request.signal.removeEventListener('abort', abortXhr);
                    }
                };
            }
            xhr.send(function () {
                if (typeof request._bodyInit === 'undefined') {
                    return null;
                }
                return request._bodyInit;
            }());
        });
    }
    fetch$1.polyfill = true;
    if (!global$1.fetch) {
        global$1.fetch = fetch$1;
        global$1.Headers = Headers;
        global$1.Request = Request;
        global$1.Response = Response;
    }

    var getUserGeoData = /*#__PURE__*/ function () {
        var _ref = _asyncToGenerator(function (geoIpLink, swarmLink) {
            var geoDataResponse, geoData, proxyAndVPNStatusResponse, _a, _b, _c, _d, result;
            return __generator$1(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, fetch(geoIpLink + "?type=json")];
                    case 1:
                        geoDataResponse = _e.sent();
                        return [4 /*yield*/, geoDataResponse.json()];
                    case 2:
                        geoData = _e.sent();
                        return [4 /*yield*/, fetch(swarmLink, {
                            headers: {
                                'swarm-session': '003bbd49-6089-4516-40c7-b2c58bf1a809-1' //TODO discussed with SWARM and decided to fix swarm session id.
                            },
                            method: 'POST',
                            body: JSON.stringify({
                                "command": "check_ip_validity",
                                "params": {
                                    "client_ip": "" + geoData.ipAddress
                                }
                            })
                        })];
                    case 3:
                        proxyAndVPNStatusResponse = _e.sent();
                        return [4 /*yield*/, proxyAndVPNStatusResponse.json()];
                    case 4:
                        _a = (_e.sent()).data, _b = _a === void 0 ? {} : _a, _c = _b.details, _d = _c === void 0 ? {} : _c, result = _d.result;
                        return [2 /*return*/, __assign$1(__assign$1({}, geoData), { proxyOrVPNStatus: result })];
                }
            });
        });
        return function getUserGeoData(_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    window.getUniqueIdentification = function (geoIpLink, swarmLink) { return __awaiter$1(void 0, void 0, void 0, function () {
        var uniqueIdentifier, collectedInfo, userGeoData;
        return __generator$1(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!geoIpLink || !swarmLink) {
                        throw new Error('GeoIp url and Swarm link are required');
                    }
                    return [4 /*yield*/, ImmortalDB.get('unique-fingerprint', '')];
                case 1:
                    uniqueIdentifier = _a.sent();
                    collectedInfo = getCollectedInfo();
                    if (!uniqueIdentifier) return [3 /*break*/, 3];
                    return [4 /*yield*/, getUserGeoData(geoIpLink, swarmLink)];
                case 2:
                    userGeoData = _a.sent();
                    return [2 /*return*/, {
                        uniqueIdentifier: uniqueIdentifier,
                        userGeoData: userGeoData,
                        collectedInfo: collectedInfo,
                    }];
                case 3: return [4 /*yield*/, generateUniqueIdentification(geoIpLink)];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var generateUniqueIdentification = function (geoIpLink) { return __awaiter$1(void 0, void 0, void 0, function () {
        var collectedInfo, userGeoData, e_1, uniqueIdentifier;
        return __generator$1(this, function (_a) {
            switch (_a.label) {
                case 0:
                    collectedInfo = getCollectedInfo();
                    userGeoData = 'not-detected';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getUserGeoData(geoIpLink)];
                case 2:
                    userGeoData = (_a.sent());
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, getFingerprint()];
                case 5:
                    uniqueIdentifier = _a.sent();
                    return [4 /*yield*/, ImmortalDB.set('unique-fingerprint', uniqueIdentifier)];
                case 6:
                    _a.sent();
                    return [2 /*return*/, {
                        userGeoData: userGeoData,
                        uniqueIdentifier: uniqueIdentifier,
                        collectedInfo: collectedInfo,
                    }];
            }
        });
    }); };
    var getFingerprint = function () { return __awaiter$1(void 0, void 0, void 0, function () {
        var fp, result;
        return __generator$1(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index.load()];
                case 1:
                    fp = _a.sent();
                    return [4 /*yield*/, fp.get()];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.visitorId];
            }
        });
    }); };


})();