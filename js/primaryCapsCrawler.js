const fs = require("fs");

const INPUT_WIDTH = 20;
const INPUT_HEIGHT = 20;
const KERNEL_WIDTH = 9;
const KERNEL_HEIGHT = 9;
const CHANNEL_COUNT = 256;
const CAPSULE_DIMENSION = 8;

async function readData(path) {
  const data = fs.readFileSync(path, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return await JSON.parse(data);
}

function crawl(inputs, kernel, bias, inputY, inputX) {
  let output = 0;
  for (let c = 0; c < CHANNEL_COUNT; c++) {
    for (let i = 0; i < KERNEL_HEIGHT; i++) {
      for (let j = 0; j < KERNEL_WIDTH; j++) {
        output += kernel[c][i][j] * inputs[c][inputY + i][inputX + j];
      }
    }
  }
  output += bias;
  return output;
}

async function reformatPrimaryCapsKernel() {
  const kernels = await readData(
    "../real-scale-inputs/primaryCapsKernelReal.json"
  );
  const output = Array(CHANNEL_COUNT).fill(0);
  for (let k = 0; k < CHANNEL_COUNT; k++) {
    const kernelPerChannel = Array(CHANNEL_COUNT).fill(0);
    for (let l = 0; l < CHANNEL_COUNT; l++) {
      const kernel = Array(KERNEL_HEIGHT).fill(0);
      for (let i = 0; i < KERNEL_HEIGHT; i++) {
        const kernelRow = Array(KERNEL_WIDTH).fill(0);
        for (let j = 0; j < KERNEL_WIDTH; j++) {
          kernelRow[j] = kernels[i][j][l][k];
        }
        kernel[i] = kernelRow;
      }
      kernelPerChannel[l] = kernel;
    }
    output[k] = kernelPerChannel;
  }
  const result = await JSON.stringify(output);
  fs.writeFile(
    "../real-scale-outputs/primaryCapsKernel.json",
    result,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

async function computePrimaryCapsOutput() {
  const output = [];

  const input = await readData("../real-scale-outputs/conv1Output.json");
  const kernels = await readData("../real-scale-inputs/primaryCapsKernel.json");
  const biases = await readData("../real-scale-inputs/primaryCapsBiases.json");

  for (let c = 0; c < CHANNEL_COUNT; c++) {
    output.push([]);
    for (let i = 0; i < INPUT_HEIGHT - KERNEL_HEIGHT + 1; i += 2) {
      output[c].push([]);
      for (let j = 0; j < INPUT_WIDTH - KERNEL_WIDTH + 1; j += 2) {
        const result = crawl(input, kernels[c], biases[c], i, j);
        output[c][i / 2].push(result);
      }
    }
  }

  const result = await JSON.stringify(output);
  fs.writeFile(
    "../real-scale-outputs/primaryCapsOutput.json",
    result,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

async function encapsulatePrimaryCapsOutput() {
  const output = [];

  const outputs = await readData(
    "../real-scale-outputs/primaryCapsOutput.json"
  );
  for (let i = 0; i < Math.ceil((INPUT_HEIGHT - KERNEL_HEIGHT + 1) / 2); i++) {
    for (let j = 0; j < Math.ceil((INPUT_WIDTH - KERNEL_WIDTH + 1) / 2); j++) {
      for (let c = 0; c < CHANNEL_COUNT / CAPSULE_DIMENSION; c++) {
        const capsule = [];
        for (let k = 0; k < CAPSULE_DIMENSION; k++) {
          capsule.push(outputs[c * CAPSULE_DIMENSION + k][i][j]);
        }
        output.push(capsule);
      }
    }
  }
  const result = await JSON.stringify(output);
  fs.writeFile(
    "../real-scale-outputs/primaryCapsOutputAfterEncapsulation.json",
    result,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

async function squashCapsules() {
  const vectors = await readData(
    "../real-scale-outputs/primaryCapsOutputAfterEncapsulation.json"
  );
  const output = [];
  for (let i = 0; i < vectors.length; i++) {
    output.push([]);
    const vec = vectors[i];
    const squaredNorm = vec
      .map((elem) => elem ** 2)
      .reduce((acc, c) => acc + c, 0);
    const norm = Math.sqrt(squaredNorm);
    const lhs = squaredNorm / (1 + squaredNorm);
    for (let j = 0; j < vec.length; j++) {
      const rhs = vec[j] / norm;
      const result = lhs * rhs;
      output[i].push(result);
    }
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  fs.writeFile(
    "../real-scale-outputs/digitCapsInputs.json",
    jsonFormattedOutput,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

// reformatPrimaryCapsKernel();
// computePrimaryCapsOutput();
// encapsulatePrimaryCapsOutput();
squashCapsules();
