const { performance } = require('perf_hooks');

// Simulation of the inefficient function
const toBinaryStringInefficient = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}

// Proposed optimization using spread operator (might hit stack limits for large arrays)
const toBinaryStringSpread = (bytes) => {
    return String.fromCharCode(...bytes);
}

// Proposed optimization using apply (might hit stack limits)
const toBinaryStringApply = (bytes) => {
    return String.fromCharCode.apply(null, bytes);
}

// Proposed optimization using subarray chunks to avoid stack overflow
const toBinaryStringChunked = (bytes) => {
    const CHUNK_SIZE = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK_SIZE));
    }
    return binary;
}

// Setup data
const SIZE = 64 * 1024; // 64KB
const data = new Uint8Array(SIZE);
for (let i = 0; i < SIZE; i++) {
    data[i] = Math.floor(Math.random() * 256);
}

console.log(`Benchmarking with ${SIZE} bytes...`);

// Warmup
for (let i = 0; i < 10; i++) toBinaryStringInefficient(data.subarray(0, 100));

// Measure Inefficient
const start1 = performance.now();
const res1 = toBinaryStringInefficient(data);
const end1 = performance.now();
console.log(`Inefficient: ${(end1 - start1).toFixed(3)} ms`);

// Measure Chunked
// Warmup
for (let i = 0; i < 10; i++) toBinaryStringChunked(data.subarray(0, 100));

const start2 = performance.now();
const res2 = toBinaryStringChunked(data);
const end2 = performance.now();
console.log(`Chunked: ${(end2 - start2).toFixed(3)} ms`);

// Verify Correctness
if (res1 !== res2) {
    console.error('Mismatch! Optimization is incorrect.');
} else {
    console.log('Results match.');
}

console.log(`Speedup: ${(end1 - start1) / (end2 - start2)}x`);
