'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise(resolve => {
        let result = [];
        let jobsInProgress = 0;
        let currentJobIndex = 0;
        processJobs();

        function handleJobResult(index, message) {
            result[index] = message;
            jobsInProgress--;
            processJobs();
        }

        function startJob(job) {
            new Promise((_resolve) => {
                setTimeout(() => _resolve(new Error('Promise timeout')), timeout);
                job().then(_resolve, _resolve);
            }).then(handleJobResult.bind(null, currentJobIndex));
            jobsInProgress++;
            currentJobIndex++;
        }

        function processJobs() {
            while (jobsInProgress < parallelNum && currentJobIndex < jobs.length) {
                startJob(jobs[currentJobIndex]);
            }
            if (currentJobIndex === jobs.length && jobsInProgress === 0) {
                resolve(result);
            }
        }
    });
}
