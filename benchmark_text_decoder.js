const { performance } = require('perf_hooks');

const SIZE = 64 * 1024;
const data = new Uint8Array(SIZE);
for (let i = 0; i < SIZE; i++) {
    data[i] = Math.floor(Math.random() * 256);
}

const toBinaryStringInefficient = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}

const toBinaryStringDecoder = (bytes) => {
    // latin1 (iso-8859-1) maps bytes 0-255 to chars 0-255 1:1
    return new TextDecoder('latin1').decode(bytes);
}

console.log(`Benchmarking TextDecoder with ${SIZE} bytes...`);

// Warmup
for (let i = 0; i < 10; i++) toBinaryStringInefficient(data.subarray(0, 100));

const start1 = performance.now();
const res1 = toBinaryStringInefficient(data);
const end1 = performance.now();
console.log(`Inefficient: ${(end1 - start1).toFixed(3)} ms`);

// Warmup Decoder
try {
    new TextDecoder('latin1');
} catch (e) {
    console.log('TextDecoder latin1 not supported');
    process.exit(1);
}

const start3 = performance.now();
const res3 = toBinaryStringDecoder(data);
const end3 = performance.now();
console.log(`TextDecoder: ${(end3 - start3).toFixed(3)} ms`);

// Verify Correctness
if (res1 !== res3) {
    console.error('Mismatch! TextDecoder result differs.');
    // Check first diff
    for(let i=0; i<res1.length; i++) {
        if(res1.charCodeAt(i) !== res3.charCodeAt(i)) {
            console.log(`Diff at ${i}: ${res1.charCodeAt(i)} vs ${res3.charCodeAt(i)}`);
            break;
        }
    }
} else {
    console.log('Results match.');
}

console.log(`Speedup: ${(end1 - start1) / (end3 - start3)}x`);
