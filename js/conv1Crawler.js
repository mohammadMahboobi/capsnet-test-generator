const fs = require("fs");

const INPUT_WIDTH = 28;
const INPUT_HEIGHT = 28;
const KERNEL_WIDTH = 9;
const KERNEL_HEIGHT = 9;
const CHANNEL_COUNT = 256;

async function readData(path) {
  const data = fs.readFileSync(path, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return await JSON.parse(data);
}

function dec2Bin(bits, number) {
  const numberBin = number >>> 0;
  const binary = numberBin.toString(2);
  if (number < 0) {
    return binary.slice(-bits);
  }
  return binary.padStart(bits, 0);
}

function crawl(input, kernel, bias, channelNumber, inputY, inputX) {
  let output = 0;
  for (let i = 0; i < KERNEL_HEIGHT; i++) {
    for (let j = 0; j < KERNEL_WIDTH; j++) {
      output += kernel[channelNumber][i][j] * input[inputY + i][inputX + j];
    }
  }
  output += bias;
  return output;
}

async function reformatConv1Kernel() {
  const kernels = await readData("../real-scale-inputs/conv1KernelReal.json");
  const output = Array(CHANNEL_COUNT).fill(0);
  for (let k = 0; k < CHANNEL_COUNT; k++) {
    const kernel = Array(KERNEL_HEIGHT).fill(0);
    for (let i = 0; i < KERNEL_HEIGHT; i++) {
      const kernelRow = Array(KERNEL_WIDTH).fill(0);
      for (let j = 0; j < KERNEL_WIDTH; j++) {
        kernelRow[j] = kernels[i][j][0][k];
      }
      kernel[i] = kernelRow;
    }
    output[k] = kernel;
  }
  const result = await JSON.stringify(output);
  fs.writeFile("../real-scale-outputs/conv1Kernel.json", result, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

async function getBinaryFileOfConv1Kernel() {
  const kernels = await readData("../real-scale-inputs/conv1Kernel.json");
  let output = "";
  for (let c = 0; c < CHANNEL_COUNT; c++) {
    for (let i = 0; i < KERNEL_HEIGHT; i++) {
      for (let j = 0; j < KERNEL_WIDTH; j++) {
        output += dec2Bin(24, kernels[c][i][j] * 1000000) + "\n";
      }
    }
  }
  fs.writeFile(
    "../real-scale-outputs/conv1KernelsBinary.txt",
    output,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

async function getBinaryFileOfConv1Bias() {
  const biases = await readData("../real-scale-inputs/conv1Bias.json");
  let output = "";
  for (let c = 0; c < CHANNEL_COUNT; c++) {
    output += dec2Bin(22, biases[c] * 1000000) + "\n";
  }
  fs.writeFile("../real-scale-outputs/conv1BiasesBinary.txt", output, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

async function computeConv1Output() {
  let output = [];

  const input = await readData("../real-scale-inputs/conv1Input.json");
  const biases = await readData("../real-scale-inputs/conv1Bias.json");
  const kernels = await readData("../real-scale-inputs/conv1Kernel.json");
  for (let c = 0; c < CHANNEL_COUNT; c++) {
    output.push([]);
    for (let i = 0; i < INPUT_HEIGHT - KERNEL_HEIGHT + 1; i++) {
      output[c].push([]);
      for (let j = 0; j < INPUT_WIDTH - KERNEL_WIDTH + 1; j++) {
        const result = crawl(input, kernels, biases[c], c, i, j);
        output[c][i].push(result < 0 ? 0 : result);
      }
    }
  }
  const result = await JSON.stringify(output);
  fs.writeFile("../real-scale-outputs/conv1Output.json", result, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

// reformatConv1Kernel();
// getBinaryFileOfConv1Kernel();
getBinaryFileOfConv1Bias();
// computeConv1Output();
