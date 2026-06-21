import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.argv[2] || process.env.PORT || 3001);

function getWindowsPids(targetPort) {
    let output = '';

    try {
        output = execSync(`netstat -ano | findstr :${targetPort}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        });
    } catch {
        return [];
    }

    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
        if (!line.includes('LISTENING')) continue;

        const parts = line.trim().split(/\s+/);
        const localAddress = parts[1] ?? '';
        const pid = Number(parts[parts.length - 1]);

        if (!localAddress.endsWith(`:${targetPort}`) || !pid) continue;
        pids.add(pid);
    }

    return [...pids];
}

function getUnixPids(targetPort) {
    try {
        const output = execSync(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        });

        return output
            .split(/\r?\n/)
            .map((value) => Number(value.trim()))
            .filter(Boolean);
    } catch {
        return [];
    }
}

function killPid(pid) {
    if (process.platform === 'win32') {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        return;
    }

    execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
}

const pids = process.platform === 'win32' ? getWindowsPids(port) : getUnixPids(port);

if (pids.length === 0) {
    console.log(`No process is using port ${port}`);
    process.exit(0);
}

for (const pid of pids) {
    try {
        killPid(pid);
        console.log(`Stopped process ${pid} on port ${port}`);
    } catch {
        console.error(`Failed to stop process ${pid} on port ${port}`);
        process.exit(1);
    }
}
