const fs = require("fs");

const INPUT_COUNT = 1152;
const INPUT_SIZE = 8;
const WEIGHT_WIDTH = 16;
const NUMBER_OF_WEIGHTS_PER_EACH_INPUT = 10;
const DYNAMIC_ROUTING_ROUNDS = 3;

async function readData(path) {
  const data = fs.readFileSync(path, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return await JSON.parse(data);
}

function writeToFile(path, content) {
  try {
    fs.writeFileSync(path, content);
  } catch (err) {
    console.error(err);
  }
}

async function resetBiases() {
  const biasesCount = INPUT_COUNT * NUMBER_OF_WEIGHTS_PER_EACH_INPUT;
  const biases = Array(biasesCount).fill(0);
  const jsonFormattedBiases = await JSON.stringify(biases);
  writeToFile("../real-scale-inputs/digitCapsBiases.json", jsonFormattedBiases);
}

async function softmax() {
  const output = [];
  const biases = await readData("../real-scale-inputs/digitCapsBiases.json");
  const expos = biases.map((bias) => Math.exp(bias));
  const sumOfExpos = expos.reduce((sum, c) => sum + c, 0);
  for (let i = 0; i < biases.length; i++) {
    const result = expos[i] / sumOfExpos;
    output.push(result);
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile(
    "../real-scale-inputs/couplingCoefficients.json",
    jsonFormattedOutput
  );
}

async function makePredictionVector() {
  const inputs = await readData("../real-scale-outputs/digitCapsInputs.json");
  const weights = await readData(
    "../real-scale-inputs/digitCapsWeightMatrixesReal.json"
  );
  const output = [];
  for (let i = 0; i < inputs.length; i++) {
    output.push([]);
    for (let j = 0; j < NUMBER_OF_WEIGHTS_PER_EACH_INPUT; j++) {
      output[i].push([]);
      for (let k = 0; k < WEIGHT_WIDTH; k++) {
        let sum = 0;
        for (let l = 0; l < INPUT_SIZE; l++) {
          sum += inputs[i][l] * weights[j][l][k];
        }
        output[i][j].push(sum);
      }
    }
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile(
    "../real-scale-inputs/predictionVectors.json",
    jsonFormattedOutput
  );
}

async function calculateWeightedSum() {
  const couplingCoefficients = await readData(
    "../real-scale-inputs/couplingCoefficients.json"
  );
  const predictionVectors = await readData(
    "../real-scale-inputs/predictionVectors.json"
  );
  const output = [];
  for (let i = 0; i < predictionVectors.length; i++) {
    output.push([]);
    for (let j = 0; j < NUMBER_OF_WEIGHTS_PER_EACH_INPUT; j++) {
      output[i].push([]);
      const currentCIndex = i * NUMBER_OF_WEIGHTS_PER_EACH_INPUT + j;
      for (let k = 0; k < WEIGHT_WIDTH; k++) {
        const result =
          couplingCoefficients[currentCIndex] * predictionVectors[i][j][k];
        output[i][j].push(result);
      }
    }
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile("../real-scale-inputs/weightedSums.json", jsonFormattedOutput);
}

async function calculateSumOfWeightedSums() {
  const weightedSums = await readData("../real-scale-inputs/weightedSums.json");
  const output = [];
  for (let i = 0; i < NUMBER_OF_WEIGHTS_PER_EACH_INPUT; i++) {
    output.push([]);
    for (let j = 0; j < WEIGHT_WIDTH; j++) {
      let result = 0;
      for (let k = 0; k < INPUT_COUNT; k++) {
        result += weightedSums[k][i][j];
      }
      output[i].push(result);
    }
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile(
    "../real-scale-inputs/sumOfWeightedSums.json",
    jsonFormattedOutput
  );
}

async function squash() {
  const vectors = await readData("../real-scale-inputs/sumOfWeightedSums.json");
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
  writeToFile("../real-scale-inputs/squashes.json", jsonFormattedOutput);
}

async function agreement() {
  const predictionVectors = await readData(
    "../real-scale-inputs/predictionVectors.json"
  );
  const squashes = await readData("../real-scale-inputs/squashes.json");
  const output = [];
  for (let i = 0; i < INPUT_COUNT; i++) {
    for (let j = 0; j < NUMBER_OF_WEIGHTS_PER_EACH_INPUT; j++) {
      let result = 0;
      for (let k = 0; k < WEIGHT_WIDTH; k++) {
        result += squashes[j][k] * predictionVectors[i][j][k];
      }
      output.push(result);
    }
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile("../real-scale-inputs/agreements.json", jsonFormattedOutput);
}

async function calculateNextBiases() {
  const biases = await readData("../real-scale-inputs/digitCapsBiases.json");
  const agreements = await readData("../real-scale-inputs/agreements.json");
  const output = [];
  for (let i = 0; i < biases.length; i++) {
    const result = biases[i] + agreements[i];
    output.push(result);
  }
  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile("../real-scale-inputs/digitCapsBiases.json", jsonFormattedOutput);
}

async function calculateSquaredVectorLengths() {
  const vectors = await readData("../real-scale-inputs/squashes.json");
  const output = [];
  for (let i = 0; i < vectors.length; i++) {
    output.push(
      vectors[i].map((vec) => vec ** 2).reduce((acc, v) => acc + v, 0)
    );
  }

  console.log(
    "Max Class Is: " +
      output.indexOf(output.reduce((a, b) => Math.max(a, b), -Infinity))
  );

  const jsonFormattedOutput = await JSON.stringify(output);
  writeToFile(
    "../real-scale-outputs/digitCapsOutput.json",
    jsonFormattedOutput
  );
}

(async () => {
  await resetBiases();
  for (let i = 0; i < DYNAMIC_ROUTING_ROUNDS; i++) {
    await softmax();
    await makePredictionVector();
    await calculateWeightedSum();
    await calculateSumOfWeightedSums();
    await squash();
    if (i < DYNAMIC_ROUTING_ROUNDS - 1) {
      await agreement();
      await calculateNextBiases();
    } else if (i === DYNAMIC_ROUTING_ROUNDS - 1) {
      calculateSquaredVectorLengths();
    }
  }
})();
