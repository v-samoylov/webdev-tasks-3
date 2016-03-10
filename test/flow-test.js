'use strict';

const sinon = require('sinon');
const flow = require('../lib/flow.js');
const assert = require('assert');

function checkResultsLater(areResultsChecked, checkResults) {
    setTimeout(function () {
        if (!areResultsChecked) {
            checkResults();
        }
    }, 1000);
}

describe('method serial', function () {
    it('should call the main callback', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.ok(callback.called, 'main callback has not been called');
            done();
        }
        var areResultsChecked = false;
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
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call all functions successively', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.ok(func1.called, 'func1 has not been called');
            assert.ok(func2.called, 'func2 has not been called');
            assert.ok(func3.called, 'func3 has not been called');
            assert.equal('ABC', result, 'functions have been called not successively');
            done();
        }
        var areResultsChecked = false;
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
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it(
        'should call the main callback after all functions results\n      have been received',
        function (done) {
        function checkResults() {
            assert.equal('ABCD', result, 'callback havent been called appropriately');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            result += 'D';
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call each function only once', function (done) {
        function checkResults() {
            assert.ok(func1.calledOnce, 'func1 has not been called only once');
            assert.ok(func2.calledOnce, 'func2 has not been called only once');
            assert.ok(func3.calledOnce, 'func3 has not been called only once');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call the main callback as soon as a function error appears', function (done) {
        function checkResults() {
            assert.ok(func1.called, 'func1 has not been called');
            assert.ok(func2.called, 'func2 has not been called');
            assert.ok(!func3.called, 'func3 has been called after an error');
            assert.ok(callback.called, 'callback has not been called');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass to each function a result of a previous function', function (done) {
        function checkResults() {
            assert.equal(func2.args[0][0], 'A', 'result has not been passed to func2');
            assert.equal(func3.args[0][0], 'B', 'result has not been passed to func3');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass a result of all functions to the main callback', function (done) {
        function checkResults() {
            assert.equal(
                callback.args[0][1], 'ABC',
                'result of all functions has not been passed to the main callback'
            );
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass a function error to the main callback', function (done) {
        function checkResults() {
            assert.deepEqual(
                callback.args[0][0], {message: 'ERROR'},
                'function error has not been passed to the main callback'
            );
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.serial([func1, func2, func3], callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
});

describe('method parallel', function () {
    it('should call the main callback', function (done) {
        function checkResults() {
            assert.ok(callback.called, 'main callback has not been called');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 3, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it(
        'should call the main callback after all functions results\n      have been received',
        function (done) {
        function checkResults() {
            assert.deepEqual(
                result, ['A', 'B', 'C'],
                'the main callback has not been called properly'
            );
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call each function only once', function (done) {
        function checkResults() {
            assert.ok(func1.calledOnce, 'func1 has not been called only once');
            assert.ok(func2.calledOnce, 'func2 has not been called only once');
            assert.ok(func3.calledOnce, 'func3 has not been called only once');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call all functions parallely', function (done) {
        function checkResults() {
            assert.equal(result, 'BCA', 'functions have not been called parallely');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass an array of results to the main callback', function (done) {
        function checkResults() {
            assert.ok(result instanceof Array, 'not an array has been passed');
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            result = data;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should return results in the same order as functions have been passed', function (done) {
        function checkResults() {
            assert.equal(
                result.join(), 'A,B,C',
                'the results have been returned in the wrong order'
            );
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            result = data;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should not run parallely number of functions higher than the limit', function (done) {
        const LIMIT = 2;
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
        var areResultsChecked = false;
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
            areResultsChecked = true;
            checkResults();
        });
        flow.parallel([func1, func2, func3], LIMIT, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass a function error to the main callback', function (done) {
        function checkResults() {
            assert.deepEqual(
                errorFound, {message: 'ERROR'},
                'the results have been returned in the wrong order'
            );
            done();
        }
        var areResultsChecked = false;
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
            areResultsChecked = true;
            errorFound = err;
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call all functions despite any functions errors', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.ok(func1.called, 'func1 has not been called');
            assert.ok(func2.called, 'func1 has not been called');
            assert.ok(func3.called, 'func1 has not been called');
            done();
        }
        var areResultsChecked = false;
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
            checkResults();
        });
        flow.parallel([func1, func2, func3], 5, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
});

describe('method map', function () {
    it('should call the main callback', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.ok(callback.called, 'the main callback has not been called');
            done();
        }
        var areResultsChecked = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20);
        });
        var callback = sinon.spy(function (err, data) {
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it(
        'should call the main callback after all functions results\n' +
        '      have been received',
        function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.deepEqual(
                result, ['AA', 'BB', 'CC'],
                'callback has not been called properly'
            );
            done();
        }
        var result;
        var areResultsChecked = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call the function only once per value', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.equal(
                func.args[0][0], 'A',
                'function has not been called only once for the first value'
            );
            assert.equal(
            func.args[1][0], 'B',
                'function has not been called only once for the second value'
            );
            assert.equal(
                func.args[2][0], 'C',
                'function has not been called only once for the third value'
            );
            assert.equal(
                func.callCount, 3,
                'function has not been called only once per value'
            );
            done();
        }
        var result;
        var areResultsChecked = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should run all calls parallely', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.ok(isRunningParallely, 'function calls have not been parallel');
            done();
        }
        var isRunningParallely = true;
        var areResultsChecked = false;
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
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass an array of results to the main callback', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.ok(
                result instanceof Array,
                'not an array has been passed'
            );
            done();
        }
        var result;
        var areResultsChecked = false;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should pass a function error to the main callback', function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.deepEqual(
                errorFound, {message: 'ERROR'},
                'error has not been passed to the main callback'
            );
            done();
        }
        var areResultsChecked = false;
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
            errorFound = err;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it(
        'should pass results to the main callback in the same order\n' +
        '      as the values have been passed',
        function (done) {
        function checkResults() {
            areResultsChecked = true;
            assert.equal(
                result.join(), 'AA,BB,CC',
                'the results have been returned in the wrong order'
            );
            done();
        }
        var areResultsChecked = false;
        var result;
        var func = sinon.spy(function (value, next) {
            setTimeout(next, 20, null, value + value);
        });
        var callback = sinon.spy(function (err, data) {
            result = data;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
    it('should call the function for all values despite any functions errors', function (done) {
        function checkResults() {
            areResultsChecked = true;
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
        var areResultsChecked = false;
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
            errorFound = err;
            checkResults();
        });
        flow.map(['A', 'B', 'C'], func, callback);
        checkResultsLater(areResultsChecked, checkResults);
    });
});

describe('method makeAsync', function () {
    it('should return an asynchronous function', function () {
        function checkResults() {
            assert.equal(
                result, 'ABC',
                'asynchronous function has not been returned'
            );
        }
        var result = null;
        var syncFunc = function (data) {
            return data;
        };
        var callback = function (err, data) {
            result = data;
        };
        var asyncFunc = flow.makeAsync(syncFunc);
        asyncFunc('ABC', callback);
        checkResults(checkResults);
    });
});
