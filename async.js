'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise(resolve => {
        let result = [];
        let jobsInProgress = 0;
        let currentJobIndex = 0;
        fillJobsQueue();
        resolveIfDone();

        function handleJobResult(index, message) {
            result[index] = message;
            jobsInProgress--;
            fillJobsQueue();
            resolveIfDone();
        }

        function startJob(job) {
            let indexedHandler = handleJobResult.bind(null, currentJobIndex);
            new Promise((_resolve, _reject) => {
                setTimeout(() => _reject(new Error('Promise timeout')), timeout);
                job().then(_resolve, _reject);
            }).then(indexedHandler, indexedHandler);
            jobsInProgress++;
            currentJobIndex++;
        }

        function fillJobsQueue() {
            while (jobsInProgress < parallelNum && currentJobIndex < jobs.length) {
                startJob(jobs[currentJobIndex]);
            }
        }

        function resolveIfDone() {
            if (currentJobIndex === jobs.length && jobsInProgress === 0) {
                resolve(result);
            }
        }
    });
}
