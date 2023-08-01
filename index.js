const fs = require("fs");

async function readData(path) {
  const data = fs.readFileSync(path, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return await JSON.parse(data);
}

function writeToFile(path, content) {
  fs.writeFile(path, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function generatePokeTestForConv1Input() {
  const format = (data, i, j) => `c.io.input(${i})(${j}).poke(${data * 10000}.S)`;

  readData("./inputs/conv1Input.json").then((dataRows) => {
    let output = "";
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      for (let j = 0; j < row.length; j++) {
        output += format(row[j], i, j) + "\n";
      }
    }
    writeToFile("./poke-tests/conv1Input.txt", output);
  });
}

function generatePokeTestForConv1Kernel() {
  const format = (data, i, j, k) =>
    `c.io.conv1Kernel(${i})(${j})(${k}).poke(${data * 100}.S)`;

  readData("./inputs/conv1Kernel.json").then((channels) => {
    let output = "";
    for (let channel = 0; channel < channels.length; channel++) {
      for (let row = 0; row < channels[channel].length; row++) {
        for (let column = 0; column < channels[channel][row].length; column++) {
          output +=
            format(channels[channel][row][column], channel, row, column) + "\n";
        }
      }
    }
    writeToFile("./poke-tests/conv1Kernel.txt", output);
  });
}

function generatePokeTestForPrimaryCapsKernel() {
  const format = (data, i, j, k) =>
    `c.io.primaryCapsKernel(${i})(${j})(${k}).poke(${data * 100}.S)`;

  readData("./inputs/primaryCapsKernel.json").then((channels) => {
    let output = "";
    for (let channel = 0; channel < channels.length; channel++) {
      for (let row = 0; row < channels[channel].length; row++) {
        for (let column = 0; column < channels[channel][row].length; column++) {
          output +=
            format(channels[channel][row][column], channel, row, column) + "\n";
        }
      }
    }
    writeToFile("./poke-tests/primaryCapsKernel.txt", output);
  });
}

function generatePokeTestForDigitCapsWeightMatrixes() {
  const format = (data, i, j, k, l) =>
    `c.io.digitCapsWeightMatrixes(${i})(${j})(${k})(${l}).poke(${data * 100}.S)`;

  readData("./inputs/digitCapsWeightMatrixes2BP.json").then(
    (weightMatrixes) => {
      let output = "";
      for (let i = 0; i < weightMatrixes.length; i++) {
        const weightMatrixesForCurrentInput = weightMatrixes[i];
        for (let j = 0; j < weightMatrixesForCurrentInput.length; j++) {
          const weightMatrixRows = weightMatrixesForCurrentInput[j];
          for (let k = 0; k < weightMatrixRows.length; k++) {
            const weightMatrixRow = weightMatrixRows[k];
            for (let l = 0; l < weightMatrixRow.length; l++) {
              output += format(weightMatrixRow[l], i, j, k, l) + "\n";
            }
          }
        }
      }
      writeToFile("./poke-tests/digitCapsWeightMatrixes.txt", output);
    }
  );
}

function generateRandomNumbers(count, digits, isSigned = false) {
  let output = "";
  const getRandomNumber = () => (Math.random() * 10 ** digits).toFixed();
  if (isSigned) {
    for (let i = 0; i < count; i++) {
      let randomNumber = getRandomNumber();
      if (Math.random() > 0.5) {
        randomNumber *= -1;
      }
      output += randomNumber + (i < count - 1 ? ", " : "");
    }
  } else {
    for (let i = 0; i < count; i++) {
      let randomNumber = getRandomNumber();
      output += randomNumber + (i < count - 1 ? ", " : "");
    }
  }
  writeToFile("./randomNumbers.txt", output);
}

// generateRandomNumbers(64, 1, true);
generatePokeTestForConv1Input();
// generatePokeTestForConv1Kernel();
// generatePokeTestForPrimaryCapsKernel();
// generatePokeTestForDigitCapsWeightMatrixes();
