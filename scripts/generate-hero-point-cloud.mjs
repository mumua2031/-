import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('public/hanxiu-magnolia.glb');
const outputPath = path.resolve('public/hanxiu-magnolia-points.bin');
const maxPoints = 12000;
const targetSize = 8.25;
const glb = fs.readFileSync(sourcePath);
let offset = 12;
let json;
let binary;

while (offset < glb.length) {
  const length = glb.readUInt32LE(offset);
  const type = glb.readUInt32LE(offset + 4);
  const data = glb.subarray(offset + 8, offset + 8 + length);
  if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8').replace(/\0+$/, ''));
  if (type === 0x004e4942) binary = data;
  offset += 8 + length;
}

if (!json || !binary) throw new Error('Invalid GLB: JSON or binary chunk is missing.');
const primitive = json.meshes?.[0]?.primitives?.[0];
const accessor = json.accessors?.[primitive?.attributes?.POSITION];
const view = json.bufferViews?.[accessor?.bufferView];
if (!accessor || !view || accessor.componentType !== 5126 || accessor.type !== 'VEC3') throw new Error('Unsupported GLB position accessor.');

const stride = view.byteStride || 12;
const start = (view.byteOffset || 0) + (accessor.byteOffset || 0);
const step = Math.max(1, Math.floor(accessor.count / maxPoints));
const sampled = [];
for (let index = 0; index < accessor.count && sampled.length < maxPoints; index += step) {
  const pointOffset = start + index * stride;
  sampled.push([
    binary.readFloatLE(pointOffset),
    binary.readFloatLE(pointOffset + 4),
    binary.readFloatLE(pointOffset + 8),
  ]);
}

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const point of sampled) for (let axis = 0; axis < 3; axis += 1) {
  min[axis] = Math.min(min[axis], point[axis]);
  max[axis] = Math.max(max[axis], point[axis]);
}
const center = min.map((value, axis) => (value + max[axis]) / 2);
const scale = targetSize / Math.max(...max.map((value, axis) => value - min[axis]), 1);
const output = Buffer.allocUnsafe(4 + sampled.length * 12);
output.writeUInt32LE(sampled.length, 0);
sampled.forEach((point, index) => point.forEach((value, axis) => output.writeFloatLE((value - center[axis]) * scale, 4 + index * 12 + axis * 4)));
fs.writeFileSync(outputPath, output);
console.log(`Generated ${sampled.length} points: ${outputPath} (${output.length} bytes)`);
