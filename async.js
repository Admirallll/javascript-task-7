'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise(_resolve => {
        let result = [];
        let promisesInProgress = 0;
        let currentIndex = 0;
        update();

        function resolve(index, message) {
            result[index] = message;
            promisesInProgress--;
            update();
        }

        function update() {
            while (promisesInProgress < parallelNum && currentIndex < jobs.length) {
                let job = jobs[currentIndex];
                new Promise((res, rej) => {
                    setTimeout(() => rej(new Error('Promise timeout')), timeout);
                    job().then(res, rej);
                }).then(resolve.bind(null, currentIndex), resolve.bind(null, currentIndex));
                promisesInProgress++;
                currentIndex++;
            }
            if (currentIndex === jobs.length && promisesInProgress === 0) {
                _resolve(result);
            }
        }
    });
}
