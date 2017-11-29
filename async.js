'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    let result = [];
    let callbacks = [];
    let promisesInProgress = 0;
    let currentIndex = 0;
    let jobsQueue = [];
    for (let job of jobs) {
        jobsQueue.push(job);
        result.push(undefined);
    }
    jobsQueue.reverse();
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
        while (promisesInProgress < parallelNum && jobsQueue.length > 0) {
            let job = jobsQueue.pop();
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
        }
    }

    return {
        then: function (callback) {
            callbacks.push(callback);

            return this;
        }
    };
}
