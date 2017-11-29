'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    let result = [];
    let callbacks = [];
    let promisesInProgress = 0;
    let currentIndex = 0;
    let isEnded = false;
    for (let i = 0; i < jobs.length; i++) {
        result.push(undefined);
    }
    update();

    function resolve(index, message) {
        result[index] = message;
        promisesInProgress--;
        update();
    }

    function reject(index, err) {
        result[index] = new Error(err);
        promisesInProgress--;
        update();
    }

    function update() {
        while (promisesInProgress < parallelNum && currentIndex < jobs.length) {
            let job = jobs[currentIndex];
            new Promise((res, rej) => {
                setTimeout(() => rej('Promise timeout'), timeout);
                job().then(res, rej);
            }).then(resolve.bind(null, currentIndex), reject.bind(null, currentIndex));
            promisesInProgress++;
            currentIndex++;
        }
        if (currentIndex === jobs.length && promisesInProgress === 0) {
            for (let callback of callbacks) {
                result = callback(result);
            }
            isEnded = true;
        }
    }

    return {
        then: function (callback) {
            if (isEnded) {
                result = callback(result);
            }
            callbacks.push(callback);

            return this;
        }
    };
}
