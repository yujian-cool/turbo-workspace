import cluster from 'cluster';
import os from 'os';

const cpuNumber = os.cpus().length;

// 多进程模式部署node服务
export const apply = (fn: () => void): void => {
    if (cluster.isPrimary) {
        for (let i = 0; i < cpuNumber; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            // 重启挂掉的进程
            cluster.fork();
        });
    } else {
        fn();
    }
}

