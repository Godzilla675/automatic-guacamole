const { performance } = require('perf_hooks');

const SIZE = 64 * 1024;
const data = new Uint8Array(SIZE);
for (let i = 0; i < SIZE; i++) {
    data[i] = Math.floor(Math.random() * 256);
}

// 1. Inefficient Loop
const toBinaryStringInefficient = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}

// 2. Chunked Apply
const toBinaryStringChunked = (bytes) => {
    const CHUNK_SIZE = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        // subarray is cheap
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK_SIZE));
    }
    return binary;
}

// 3. TextDecoder
const toBinaryStringDecoder = (bytes) => {
    return new TextDecoder('latin1').decode(bytes);
}

console.log(`Benchmarking with ${SIZE} bytes...`);

// Warmup
for (let i = 0; i < 5; i++) {
    toBinaryStringInefficient(data);
    toBinaryStringChunked(data);
    toBinaryStringDecoder(data);
}

const start1 = performance.now();
for(let i=0; i<10; i++) toBinaryStringInefficient(data);
const end1 = performance.now();
console.log(`Inefficient: ${((end1 - start1)/10).toFixed(3)} ms`);

const start2 = performance.now();
for(let i=0; i<10; i++) toBinaryStringChunked(data);
const end2 = performance.now();
console.log(`Chunked Apply: ${((end2 - start2)/10).toFixed(3)} ms`);

const start3 = performance.now();
for(let i=0; i<10; i++) toBinaryStringDecoder(data);
const end3 = performance.now();
console.log(`TextDecoder: ${((end3 - start3)/10).toFixed(3)} ms`);

// Verify Correctness
const res1 = toBinaryStringInefficient(data.subarray(0, 100));
const res2 = toBinaryStringChunked(data.subarray(0, 100));
const res3 = toBinaryStringDecoder(data.subarray(0, 100));

if (res1 === res2 && res1 === res3) {
    console.log('Results match.');
} else {
    console.error('Mismatch!');
}
