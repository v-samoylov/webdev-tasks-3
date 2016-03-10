'use strict';

const sinon = require('sinon');
const flow = require('../lib/flow.js');
const assert = require('assert');

describe('method serial', function () {
    it('should call the main callback',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (data, next) {
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (data, next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.ok(callback.called, 'main callback has not been called');
                done();
            }, 100);
        }
    );
    it('should call all functions successively',
        function (done) {
            var result = '';
            var func1 = sinon.spy(function (next) {
                result += 'A';
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (data, next) {
                result += 'B';
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (data, next) {
                result += 'C';
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.ok(func1.called, 'func1 has not been called');
                assert.ok(func2.called, 'func2 has not been called');
                assert.ok(func3.called, 'func3 has not been called');
                assert.strictEqual('ABC', result, 'functions have been called not successively');
                done();
            }, 100);
        }
    );
    it(
        'should call the main callback after all functions results\n' +
        '      have been received',
        function (done) {
            var result = '';
            var func1 = sinon.spy(function (next) {
                result += 'A';
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (data, next) {
                result += 'B';
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (data, next) {
                result += 'C';
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
                result += 'D';
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.strictEqual('ABCD', result, 'callback havent been called appropriately');
                done();
            }, 100);
        }
    );
    it('should call each function only once',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (data, next) {
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (data, next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.ok(func1.calledOnce, 'func1 has not been called only once');
                assert.ok(func2.calledOnce, 'func2 has not been called only once');
                assert.ok(func3.calledOnce, 'func3 has not been called only once');
                done();
            }, 100);
        }
    );
    it('should call the main callback as soon as a function error appears',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (data, next) {
                var error = {message: 'ERROR'};
                setTimeout(next, 10, error);
            });
            var func3 = sinon.spy(function (data, next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.ok(func1.called, 'func1 has not been called');
                assert.ok(func2.called, 'func2 has not been called');
                assert.ok(!func3.called, 'func3 has been called after an error');
                assert.ok(callback.called, 'callback has not been called');
                done();
            }, 100);
        }
    );
    it('should pass to each function a result of a previous function',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20, null, 'A');
            });
            var func2 = sinon.spy(function (data, next) {
                setTimeout(next, 10, null, 'B');
            });
            var func3 = sinon.spy(function (data, next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.strictEqual(func2.args[0][0], 'A', 'result has not been passed to func2');
                assert.strictEqual(func3.args[0][0], 'B', 'result has not been passed to func3');
                done();
            }, 100);
        }
    );
    it('should pass a result of all functions to the main callback',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20, null, 'A');
            });
            var func2 = sinon.spy(function (data, next) {
                setTimeout(next, 10, null, data + 'B');
            });
            var func3 = sinon.spy(function (data, next) {
                setTimeout(next, 30, null, data + 'C');
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.strictEqual(
                    callback.args[0][1], 'ABC',
                    'result of all functions has not been passed to the main callback'
                );
                done();
            }, 100);
        }
    );
    it('should pass a function error to the main callback',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (data, next) {
                var error = {message: 'ERROR'};
                setTimeout(next, 10, error);
            });
            var func3 = sinon.spy(function (data, next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.serial([func1, func2, func3], callback);
            setTimeout(function () {
                assert.deepEqual(
                    callback.args[0][0], {message: 'ERROR'},
                    'function error has not been passed to the main callback'
                );
                done();
            }, 100);
        }
    );
});

describe('method parallel', function () {
    it('should call the main callback',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (next) {
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (data) {
            });
            flow.parallel([func1, func2, func3], 3, callback);
            setTimeout(function () {
                assert.ok(callback.called, 'main callback has not been called');
                done();
            }, 100);
        }
    );
    it(
        'should call the main callback after all functions results\n' +
        '      have been received',
        function (done) {
            var result = [];
            var func1 = sinon.spy(function (next) {
                result.push('A');
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (next) {
                result.push('B');
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (next) {
                result.push('C');
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.deepEqual(
                    result, ['A', 'B', 'C'],
                    'the main callback has not been called properly'
                );
                done();
            }, 100);
        }
    );
    it('should call each function only once',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 20);
            });
            var func2 = sinon.spy(function (next) {
                setTimeout(next, 10);
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(next, 30);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.ok(func1.calledOnce, 'func1 has not been called only once');
                assert.ok(func2.calledOnce, 'func2 has not been called only once');
                assert.ok(func3.calledOnce, 'func3 has not been called only once');
                done();
            }, 100);
        }
    );
    it('should call all functions parallely',
        function (done) {
            var result = '';
            var func1 = sinon.spy(function (next) {
                setTimeout(() => {
                    result += 'A';
                    next();
                }, 30);
            });
            var func2 = sinon.spy(function (next) {
                setTimeout(() => {
                    result += 'B';
                    next();
                }, 10);
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(() => {
                    result += 'C';
                    next();
                }, 20);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.strictEqual(result, 'BCA', 'functions have not been called parallely');
                done();
            }, 100);
        }
    );
    it('should pass an array of results to the main callback',
        function (done) {
            var result;
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 30, null, 'A');
            });
            var func2 = sinon.spy(function (next) {
                setTimeout(next, 10, null, 'B');
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(next, 20, null, 'C');
            });
            var callback = sinon.spy(function (err, data) {
                result = data;
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.ok(result instanceof Array, 'not an array has been passed');
                done();
            }, 100);
        }
    );
    it('should return results in the same order as functions\n' +
        '      have been passed',
        function (done) {
            var result;
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 30, null, 'A');
            });
            var func2 = sinon.spy(function (next) {
                setTimeout(next, 10, null, 'B');
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(next, 20, null, 'C');
            });
            var callback = sinon.spy(function (err, data) {
                result = data;
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.strictEqual(
                    result.join(), 'A,B,C',
                    'the results have been returned in the wrong order'
                );
                done();
            }, 100);
        }
    );
    it('should not run parallely number of functions\n' +
        '      higher than the limit',
        function (done) {
            const LIMIT = 2;
            function runAsyncFunction(timeout, cb) {
                funcsRunningCounter > LIMIT ?
                    isLimitExceeded = true :
                    null;
                setTimeout(function () {
                    funcsRunningCounter--;
                    cb();
                }, timeout);
            }
            var isLimitExceeded = false;
            var funcsRunningCounter = 0;
            var func1 = sinon.spy(function (next) {
                funcsRunningCounter++;
                runAsyncFunction(30, next);
            });
            var func2 = sinon.spy(function (next) {
                funcsRunningCounter++;
                runAsyncFunction(10, next);
            });
            var func3 = sinon.spy(function (next) {
                funcsRunningCounter++;
                runAsyncFunction(20, next);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.parallel([func1, func2, func3], LIMIT, callback);
            setTimeout(function () {
                assert.ok(isLimitExceeded <= LIMIT, 'limit is exceeded');
                done();
            }, 100);
        }
    );
    it('should pass a function error to the main callback',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 30, null, 'A');
            });
            var func2 = sinon.spy(function (next) {
                var err = {message: 'ERROR'};
                setTimeout(next, 10, err, 'B');
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(next, 20, null, 'C');
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.deepEqual(
                    callback.args[0][0], {message: 'ERROR'},
                    'the results have been returned in the wrong order'
                );
                done();
            }, 100);
        }
    );
    it('should call all functions despite any functions errors',
        function (done) {
            var func1 = sinon.spy(function (next) {
                setTimeout(next, 30, null, 'A');
            });
            var func2 = sinon.spy(function (next) {
                setTimeout(next, 10, null, 'B');
            });
            var func3 = sinon.spy(function (next) {
                setTimeout(next, 20, null, 'C');
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.parallel([func1, func2, func3], 5, callback);
            setTimeout(function () {
                assert.ok(func1.called, 'func1 has not been called');
                assert.ok(func2.called, 'func1 has not been called');
                assert.ok(func3.called, 'func1 has not been called');
                done();
            }, 100);
        }
    );
});

describe('method map', function () {
    it('should call the main callback',
        function (done) {
            var func = sinon.spy(function (value, next) {
                setTimeout(next, 20);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.ok(callback.called, 'the main callback has not been called');
                done();
            }, 100);
        }
    );
    it(
        'should call the main callback after all functions results\n' +
        '      have been received',
        function (done) {
            var result;
            var func = sinon.spy(function (value, next) {
                setTimeout(next, 20, null, value + value);
            });
            var callback = sinon.spy(function (err, data) {
                result = data;
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.deepEqual(
                    result, ['AA', 'BB', 'CC'],
                    'callback has not been called properly'
                );
                done();
            }, 100);
        }
    );
    it('should call the function only once per value',
        function (done) {
            var result;
            var func = sinon.spy(function (value, next) {
                setTimeout(next, 20, null, value + value);
            });
            var callback = sinon.spy(function (err, data) {
                result = data;
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.strictEqual(
                    func.args[0][0], 'A',
                    'function has not been called only once for the first value'
                );
                assert.strictEqual(
                func.args[1][0], 'B',
                    'function has not been called only once for the second value'
                );
                assert.strictEqual(
                    func.args[2][0], 'C',
                    'function has not been called only once for the third value'
                );
                assert.strictEqual(
                    func.callCount, 3,
                    'function has not been called only once per value'
                );
                done();
            }, 100);
        }
    );
    it('should run all calls parallely',
        function (done) {
            var isRunningParallely = true;
            var runningCallsCounter;
            var func = sinon.spy(function (value, next) {
                runningCallsCounter < 1 ?
                    isRunningParallely = false :
                    null;
                runningCallsCounter ?
                    runningCallsCounter++ :
                    runningCallsCounter = 1;
                setTimeout(function () {
                    runningCallsCounter--;
                    next();
                }, 20);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.ok(isRunningParallely, 'function calls have not been parallel');
                done();
            }, 100);
        }
    );
    it('should pass an array of results to the main callback',
        function (done) {
            var result;
            var func = sinon.spy(function (value, next) {
                setTimeout(next, 20, null, value + value);
            });
            var callback = sinon.spy(function (err, data) {
                result = data;
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.ok(
                    result instanceof Array,
                    'not an array has been passed'
                );
                done();
            }, 100);
        }
    );
    it('should pass a function error to the main callback',
        function (done) {
            var isErrorAppeared = false;
            var func = sinon.spy(function (value, next) {
                var error = null;
                if (!isErrorAppeared) {
                    error = {message: 'ERROR'};
                    isErrorAppeared = true;
                }
                setTimeout(next, 20, error, value + value);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.deepEqual(
                    callback.args[0][0], {message: 'ERROR'},
                    'error has not been passed to the main callback'
                );
                done();
            }, 100);
        }
    );
    it(
        'should pass results to the main callback in the same order\n' +
        '      as the values have been passed',
        function (done) {
            var result;
            var func = sinon.spy(function (value, next) {
                setTimeout(next, 20, null, value + value);
            });
            var callback = sinon.spy(function (err, data) {
                result = data;
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.strictEqual(
                    result.join(), 'AA,BB,CC',
                    'the results have been returned in the wrong order'
                );
                done();
            }, 100);
        }
    );
    it('should call the function for all values despite any\n' +
        '      functions errors',
        function (done) {
            var isErrorAppeared = false;
            var func = sinon.spy(function (value, next) {
                var error = null;
                if (!isErrorAppeared) {
                    error = {message: 'ERROR'};
                    isErrorAppeared = true;
                }
                setTimeout(next, 20, error, value + value);
            });
            var callback = sinon.spy(function (err, data) {
            });
            flow.map(['A', 'B', 'C'], func, callback);
            setTimeout(function () {
                assert.strictEqual(
                    func.args[0][0], 'A',
                    'function has not been called for the first value'
                );
                assert.strictEqual(
                    func.args[1][0], 'B',
                    'function has not been called for the second value'
                );
                assert.strictEqual(
                    func.args[2][0], 'C',
                    'function has not been called for the third value'
                );
                done();
            }, 100);
        }
    );
});

describe('method makeAsync', function () {
    it('should return an asynchronous function',
        function (done) {
            var isTestFuncCalledEarlier = false;
            var testFunc = sinon.spy(function () {
            });
            var syncFunc = function (data) {
                return data;
            };
            var callback = function (err, data) {
                testFunc.called ?
                    isTestFuncCalledEarlier = true :
                    null;
            };
            var asyncFunc = flow.makeAsync(syncFunc);
            asyncFunc('A', callback);
            testFunc();
            setTimeout(function () {
                assert.ok(isTestFuncCalledEarlier, 'function is not asynchronous');
                done();
            }, 100);
        }
    );
    it(
        'should return an asynchronous function which passes\n' +
        '      data to the synchronous function',
        function (done) {
            var syncFunc = sinon.spy(function (data) {
                return data;
            });
            var callback = function (err, data) {
            };
            var asyncFunc = flow.makeAsync(syncFunc);
            asyncFunc('ABC', callback);
            setTimeout(function () {
                assert.strictEqual(syncFunc.args[0][0], 'ABC', 'data has not been passed');
                done();
            }, 100);
        }
    );
    it(
        'should return an asynchronous function which calls\n' +
        '      the given callback',
        function (done) {
            var syncFunc = function (data) {
                return data;
            };
            var callback = sinon.spy(function (err, data) {
            });
            var asyncFunc = flow.makeAsync(syncFunc);
            asyncFunc('ABC', callback);
            setTimeout(function () {
                assert.ok(callback.called, 'ABC', 'data has not been passed');
                done();
            }, 100);
        }
    );
    it(
        'should return an asynchronous function which passes\n' +
        '      a result of the synchronous function to the callback',
        function (done) {
            var syncFunc = function (data) {
                return data + data;
            };
            var callback = sinon.spy(function (err, data) {
            });
            var asyncFunc = flow.makeAsync(syncFunc);
            asyncFunc('ABC', callback);
            setTimeout(function () {
                assert.strictEqual(
                    callback.args[0][1], 'ABCABC',
                    'data has not been passed to the callback'
                );
                done();
            }, 100);
        }
    );
    it(
        'should return an asynchronous function which passes\n' +
        '      a function error to the given callback',
        function (done) {
            var syncFunc = function (data) {
                throw {message: 'ERROR'};
            };
            var callback = sinon.spy(function (err, data) {
            });
            var asyncFunc = flow.makeAsync(syncFunc);
            asyncFunc('ABC', callback);
            setTimeout(function () {
                assert.deepEqual(
                    callback.args[0][0], {message: 'ERROR'},
                    'function error has not been passed'
                );
                done();
            }, 100);
        }
    );
});

