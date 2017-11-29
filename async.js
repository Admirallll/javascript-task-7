'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise(resolve => {
        let result = [];
        let promisesInProgress = 0;
        let currentIndex = 0;
        update();

        function handleJobResult(index, message) {
            result[index] = message;
            promisesInProgress--;
            update();
        }

        function startJob(job) {
            let indexedHandler = handleJobResult.bind(null, currentIndex);
            new Promise((res, rej) => {
                setTimeout(() => rej(new Error('Promise timeout')), timeout);
                job().then(res, rej);
            }).then(indexedHandler, indexedHandler);
            promisesInProgress++;
            currentIndex++;
        }

        function update() {
            while (promisesInProgress < parallelNum && currentIndex < jobs.length) {
                startJob(jobs[currentIndex]);
            }
            if (currentIndex === jobs.length && promisesInProgress === 0) {
                resolve(result);
            }
        }
    });
}
