'use strict';

const sinon = require('sinon');
const flow = require('../lib/flow.js');
const assert = require('assert');

describe('method serial', function () {
    it('should call a main callback', function (done) {
        function checkResults() {
            assert.ok(callback.called, 'main callback has not been called');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call all functions successively', function (done) {
        function checkResults() {
            assert.ok(func1.called, 'func1 is not called');
            assert.ok(func2.called, 'func2 is not called');
            assert.ok(func3.called, 'func3 is not called');
            assert.equal('ABC', result, 'Functions are called not successively');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it(
        'should call a main callback after all functions results has been received',
        function (done) {
        function checkResults() {
            assert.equal('ABCD', result, 'callback havent been called appropriately');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            result += 'D';
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call each function only once', function (done) {
        function checkResults() {
            assert.ok(func1.calledOnce, 'func1 is called not only once');
            assert.ok(func2.calledOnce, 'func2 is called not only once');
            assert.ok(func3.calledOnce, 'func3 is called not only once');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call a main callback as soon as a function error appears', function (done) {
        function checkResults() {
            assert.ok(func1.called, 'func1 is not called');
            assert.ok(func2.called, 'func2 is not called');
            assert.ok(!func3.called, 'func3 is called');
            assert.ok(callback.calledOnce, 'callback is not called');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass to each function a result of a previous one', function (done) {
        function checkResults() {
            assert.equal(func2.args[0][0], 'A', 'Result is not passed to func2');
            assert.equal(func3.args[0][0], 'B', 'Result is not passed to func3');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass a result of all functions to a main callback', function (done) {
        function checkResults() {
            assert.equal(
                callback.args[0][1], 'ABC',
                'Result of all functions is not passed to the main callback'
            );
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass a function error to a main callback', function (done) {
        function checkResults() {
            assert.deepEqual(
                callback.args[0][0], {message: 'ERROR'},
                'Function error is not passed to the main callback'
            );
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
});

describe('method parallel', function () {
    it('should call a main callback', function (done) {
        function checkResults() {
            assert.ok(callback.called, 'main callback has not been called');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 3, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it(
        'should call a main callback after all functions results has been received',
        function (done) {
        function checkResults() {
            assert.deepEqual(result, ['A', 'B', 'C'], 'callback has not been called properly');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call each function only once', function (done) {
        function checkResults() {
            assert.ok(func1.calledOnce, 'func1 is called not only once');
            assert.ok(func2.calledOnce, 'func2 is called not only once');
            assert.ok(func3.calledOnce, 'func3 is called not only once');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call all functions parallely', function (done) {
        function checkResults() {
            assert.equal(result, 'BCA', 'functions have not been called parallely');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass results to a main callback in an array', function (done) {
        function checkResults() {
            assert.ok(result instanceof Array, 'not an array has been passed');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            result = data;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should return results in a same order as functions have been passed', function (done) {
        function checkResults() {
            assert.equal(
                result.join(), 'A,B,C',
                'the results have been returned in the wrong order'
            );
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            result = data;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should not run parallely number of functions higher than a limit', function (done) {
        const LIMIT = 4;
        function checkResults() {
            assert.ok(funcsRunningCounter <= LIMIT, 'limit is exceeded');
            done();
        }
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
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 2, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass a function error to a main callback', function (done) {
        function checkResults() {
            assert.deepEqual(
                errorFound, {message: 'ERROR'},
                'the results have been returned in the wrong order'
            );
            done();
        }
        var isCallbackCalled = false;
        var errorFound;
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
            isCallbackCalled = true;
            errorFound = err;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call all functions despite any functions errors', function (done) {
        function checkResults() {
            assert.ok(func1.called, 'func1 is not called');
            assert.ok(func2.called, 'func1 is not called');
            assert.ok(func3.called, 'func1 is not called');
            done();
        }
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
});/**/

describe('method map', function () {
    it('should call a main callback', function (done) {
        function checkResults() {
            assert.ok(callback.called, 'callback has not been called');
            done();
        }
        var isCallbackCalled = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20);
        });
        var callback = sinon.spy(function (err, data) {
            isCallbackCalled = true;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it(
        'should call a main callback after all functions results have been received',
        function (done) {
        function checkResults() {
            assert.deepEqual(
                result, ['AA', 'BB', 'CC'],
                'callback has not been called properly'
            );
            done();
        }
        var result;
        var isCallbackCalled = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            isCallbackCalled = true;
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call a function only once per value', function (done) {
        function checkResults() {
            assert.equal(func.args[0][0], 'A', 'function has not been called once per value');
            assert.equal(func.args[1][0], 'B', 'function has not been called once per value');
            assert.equal(func.args[2][0], 'C', 'function has not been called once per value');
            done();
        }
        var result;
        var isCallbackCalled = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            isCallbackCalled = true;
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should run all calls parallely', function (done) {
        function checkResults() {
            assert.ok(isRunningParallely, 'function has not been called once per value');
            done();
        }
        var isRunningParallely = true;
        var isCallbackCalled = false;
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
            isCallbackCalled = true;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass results to a main callback in an array', function (done) {
        function checkResults() {
            assert.ok(
                result instanceof Array,
                'not an array has been passed'
            );
            done();
        }
        var result;
        var isCallbackCalled = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            isCallbackCalled = true;
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should pass a function error to a main callback', function (done) {
        function checkResults() {
            assert.deepEqual(
                errorFound, {message: 'ERROR'},
                'error has not been passed to a main callback'
            );
            done();
        }
        var isCallbackCalled = false;
        var errorFound;
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
            isCallbackCalled = true;
            errorFound = err;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should return results in a same order as values have been passed', function (done) {
        function checkResults() {
            assert.equal(
                result.join(), 'AA,BB,CC',
                'the results have been returned in the wrong order'
            );
            done();
        }
        var isCallbackCalled = false;
        var result;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            isCallbackCalled = true;
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
    it('should call all functions despite any functions errors', function (done) {
        function checkResults() {
            assert.equal(
                func.args[0][0], 'A',
                'function has not been called for the first value'
            );
            assert.equal(
                func.args[1][0], 'B',
                'function has not been called for the second value'
            );
            assert.equal(
                func.args[2][0], 'C',
                'function has not been called for the third value'
            );
            done();
        }
        var isCallbackCalled = false;
        var errorFound;
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
            isCallbackCalled = true;
            errorFound = err;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        setTimeout(function () {
            if (!isCallbackCalled) {
                checkResults();
            }
        }, 1000);
    });
});
