#!/usr/bin/env node
/**
 * Test runner: executes every test file in its own Mocha process.
 *
 * Why not plain `mocha tests/*.js`?  Most test files boot the game inside a hand-rolled JSDOM and
 * assign `global.window`, `global.document`, `global.BLOCK`, ... without cleaning up.  Run in one
 * process they trample each other (dozens of spurious failures); run one-process-per-file they are
 * all green.  This runner gives each file a clean process, runs a few in parallel, and prints one
 * summary at the end.
 *
 * Usage:
 *   node scripts/run-tests.js                      # all tests/*.js
 *   node scripts/run-tests.js tests/test_mob.js    # specific files (or directories)
 *   node scripts/run-tests.js --jobs 4 --timeout 60000
 *   node scripts/run-tests.js --verbose            # stream mocha output for every file, not just failures
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_JOBS = Math.max(1, Math.min(4, os.cpus().length));

function parseArgs(argv) {
    const opts = { files: [], jobs: DEFAULT_JOBS, timeout: DEFAULT_TIMEOUT_MS, verbose: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--jobs' || a === '-j') opts.jobs = parseInt(argv[++i], 10) || DEFAULT_JOBS;
        else if (a.startsWith('--jobs=')) opts.jobs = parseInt(a.split('=')[1], 10) || DEFAULT_JOBS;
        else if (a === '--timeout' || a === '-t') opts.timeout = parseInt(argv[++i], 10) || DEFAULT_TIMEOUT_MS;
        else if (a.startsWith('--timeout=')) opts.timeout = parseInt(a.split('=')[1], 10) || DEFAULT_TIMEOUT_MS;
        else if (a === '--verbose' || a === '-v') opts.verbose = true;
        else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
        else opts.files.push(a);
    }
    return opts;
}

function printHelp() {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).map(l => l.replace(/^ \*\s?/, '')).join('\n'));
}

function collectFiles(inputs) {
    const targets = inputs.length ? inputs : ['tests'];
    const files = [];
    for (const t of targets) {
        const abs = path.resolve(ROOT, t);
        if (!fs.existsSync(abs)) { console.error(`No such file or directory: ${t}`); process.exit(2); }
        if (fs.statSync(abs).isDirectory()) {
            for (const f of fs.readdirSync(abs).sort()) {
                if (f.endsWith('.js') && f.startsWith('test')) files.push(path.join(abs, f));
            }
        } else {
            files.push(abs);
        }
    }
    return files;
}

function runOne(file, opts) {
    return new Promise(resolve => {
        const mochaBin = require.resolve('mocha/bin/mocha.js');
        const started = Date.now();
        const child = spawn(process.execPath, [mochaBin, file, '--timeout', String(opts.timeout), '--color'], {
            cwd: ROOT,
            env: Object.assign({}, process.env, { FORCE_COLOR: process.stdout.isTTY ? '1' : '0' }),
            stdio: ['ignore', 'pipe', 'pipe']
        });
        let out = '';
        child.stdout.on('data', d => { out += d; if (opts.verbose) process.stdout.write(d); });
        child.stderr.on('data', d => { out += d; if (opts.verbose) process.stderr.write(d); });
        child.on('close', code => {
            const passing = (out.match(/(\d+) passing/) || [0, 0])[1];
            const failing = (out.match(/(\d+) failing/) || [0, 0])[1];
            const pending = (out.match(/(\d+) pending/) || [0, 0])[1];
            resolve({ file, code, out, passing: +passing, failing: +failing, pending: +pending, ms: Date.now() - started });
        });
    });
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const files = collectFiles(opts.files);
    if (!files.length) { console.error('No test files found.'); process.exit(2); }

    console.log(`Running ${files.length} test file(s), ${opts.jobs} at a time, timeout ${opts.timeout}ms each test\n`);

    const results = [];
    let next = 0;
    async function worker() {
        while (next < files.length) {
            const file = files[next++];
            const r = await runOne(file, opts);
            results.push(r);
            const rel = path.relative(ROOT, r.file);
            const status = r.code === 0 ? 'PASS' : 'FAIL';
            const counts = `${r.passing} passing${r.failing ? `, ${r.failing} failing` : ''}${r.pending ? `, ${r.pending} pending` : ''}`;
            console.log(`${status}  ${rel.padEnd(62)} ${counts.padEnd(26)} ${(r.ms / 1000).toFixed(1)}s`);
        }
    }
    await Promise.all(Array.from({ length: Math.min(opts.jobs, files.length) }, worker));

    const failed = results.filter(r => r.code !== 0);
    const totals = results.reduce((a, r) => ({ p: a.p + r.passing, f: a.f + r.failing, s: a.s + r.pending }), { p: 0, f: 0, s: 0 });

    if (failed.length && !opts.verbose) {
        console.log('\n' + '='.repeat(80) + '\nFAILURE DETAILS\n' + '='.repeat(80));
        for (const r of failed) {
            console.log(`\n--- ${path.relative(ROOT, r.file)} (exit code ${r.code}) ---`);
            // Hide jsdom's "Not implemented" noise unless it is all we have.
            const lines = r.out.split('\n').filter(l => !/Not implemented: /.test(l));
            console.log(lines.join('\n').trim());
        }
    }

    console.log('\n' + '-'.repeat(80));
    console.log(`Files: ${results.length - failed.length}/${results.length} passed   Tests: ${totals.p} passing, ${totals.f} failing${totals.s ? `, ${totals.s} pending` : ''}`);
    if (failed.length) {
        console.log(`Failed files:\n  ${failed.map(r => path.relative(ROOT, r.file)).join('\n  ')}`);
    }
    process.exit(failed.length ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
