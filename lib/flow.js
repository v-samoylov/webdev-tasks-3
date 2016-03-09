'use strict';

module.exports.serial = function (funcList, callback) {
    var funcCounter = 0;
    var _callback = function (error, data) {
        if (error || (funcCounter === funcList.length)) {
            return callback(error, data);
            return;
        }
        var func = funcList[funcCounter];
        funcCounter++;
        func.length === 1 ? func(_callback) : func(data, _callback);
    };
    _callback();
};
module.exports.parallel = function (funcList, limit, callback) {
    var funcResults = [];
    var errorFound = null;
    var funcCounter = 0;
    var funcResultsCounter = 0;
    function runNextFunc() {
        var i = funcCounter;
        function _callback(error, data) {
            funcResultsCounter++;
            funcResults[i] = data;
            if (error && !errorFound) {
                errorFound = error;
            }
            if (funcList.length === funcResultsCounter) {
                return callback(errorFound, funcResults);
            } else {
                return runNextFunc();
            }
        }
        var func = funcList[funcCounter++];
        func ? func(_callback) : null;
    }
    for (var i = 0; i < limit; i++) {
        runNextFunc();
    }
};

module.exports.map = function (valueList, func, callback) {
    var funcResults = [];
    var errorFound = null;
    var _callback = function (error, data) {
        funcResults[this.i] = data;
        if (error && !errorFound) {
            errorFound = error;
        }
        if (valueList.length === funcResults.length) {
            return callback(errorFound, funcResults);
        }
    };
    valueList.forEach(function (value, index) {
        func(value, _callback.bind({i: index}));
    });
};

module.exports.makeAsync = function (func) {
    return function (data, _callback) {
        data = func(data);
        _callback(null, data);
    };
};
