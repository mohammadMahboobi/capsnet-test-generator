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
  const format = (data, i, j) =>
    `c.io.input(${i})(${j}).poke(${data * 10000}.S)`;

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
    `c.io.conv1Kernel(${i})(${j})(${k}).poke(${data * 10000}.S)`;

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
    `c.io.primaryCapsKernel(${i})(${j})(${k}).poke(${data * 10000}.S)`;

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
    `c.io.digitCapsWeightMatrixes(${i})(${j})(${k})(${l}).poke(${
      data * 10000
    }.S)`;

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

function generateVerilogInputDeclaration(bits, width, height) {
  let output = `reg [${bits - 1}:0] `;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      output +=
        `io_input_${i}_${j}` +
        (i === height - 1 && j === width - 1 ? ";" : ", ") +
        ((i !== 0 && j === 0) || j === 5 ? "\n" : "");
    }
  }
  writeToFile("./verilog-test-bench/declaration/input-declaration.txt", output);
}

function generateVerilogConv1KernelDeclaration(bits, channels, width, height) {
  let output = `reg [${bits - 1}:0] `;
  for (let i = 0; i < channels; i++) {
    for (let j = 0; j < height; j++) {
      for (let k = 0; k < width; k++) {
        output +=
          (k === 0 ? "\n" : "") +
          `io_conv1Kernel_${i}_${j}_${k}` +
          (i === channels - 1 && j === height - 1 && k === width - 1
            ? ";"
            : ", ");
      }
    }
  }
  writeToFile(
    "./verilog-test-bench/declaration/conv1Kernel-declaration.txt",
    output
  );
}

function generateVerilogPrimaryCapsKernelDeclaration(
  bits,
  channels,
  width,
  height
) {
  let output = `reg [${bits - 1}:0] `;
  for (let i = 0; i < channels; i++) {
    for (let j = 0; j < height; j++) {
      for (let k = 0; k < width; k++) {
        output +=
          (k === 0 ? "\n" : "") +
          `io_primaryCapsKernel_${i}_${j}_${k}` +
          (i === channels - 1 && j === height - 1 && k === width - 1
            ? ";"
            : ", ");
      }
    }
  }
  writeToFile(
    "./verilog-test-bench/declaration/primaryCapsKernel-declaration.txt",
    output
  );
}

function generateVerilogDigitCapsWeightMatrixesDeclaration(
  bits,
  inputCount,
  numberOfWeightMatrixesPerEachInput,
  height,
  width
) {
  let counter = 0;
  let output = `reg [${bits - 1}:0] `;
  for (let i = 0; i < inputCount; i++) {
    for (let j = 0; j < numberOfWeightMatrixesPerEachInput; j++) {
      for (let k = 0; k < height; k++) {
        for (let l = 0; l < width; l++) {
          counter += 1;
          output +=
            `io_digitCapsWeightMatrixes_${i}_${j}_${k}_${l}` +
            (i === inputCount - 1 &&
            j === numberOfWeightMatrixesPerEachInput - 1 &&
            k === height - 1 &&
            l === width - 1
              ? ";"
              : ", ");
          if (counter === 3) {
            output += "\n";
            counter = 0;
          }
        }
      }
    }
  }
  writeToFile(
    "./verilog-test-bench/declaration/digitCapsWeightMatrixes-declaration.txt",
    output
  );
}

function generateVerilogOutputDeclaration(bits, count) {
  let output = `wire [${bits - 1}:0] `;
  for (let i = 0; i < count; i++) {
    output += `io_output_${i}` + (i === count - 1 ? ";" : ", ");
  }
  writeToFile(
    "./verilog-test-bench/declaration/output-declaration.txt",
    output
  );
}

function generateVerilogInputInitialization(bits) {
  const format = (data, i, j) =>
    `io_input_${i}_${j} = ${bits}'d${data * 10000};`;

  readData("./inputs/conv1Input.json").then((dataRows) => {
    let output = "";
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      for (let j = 0; j < row.length; j++) {
        output += format(row[j], i, j) + "\n";
      }
    }
    writeToFile(
      "./verilog-test-bench/initialization/input-initialization.txt",
      output
    );
  });
}

function generateVerilogConv1KernelInitialization(bits) {
  const format = (data, i, j, k) =>
    `io_conv1Kernel_${i}_${j}_${k} = ${data < 0 ? "-" : ""}${bits}'d${
      Math.abs(data) * 10000
    };`;

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
    writeToFile(
      "./verilog-test-bench/initialization/conv1Kernel-initialization.txt",
      output
    );
  });
}

function generateVerilogPrimaryCapsKernelInitialization(bits) {
  const format = (data, i, j, k) =>
    `io_primaryCapsKernel_${i}_${j}_${k} = ${data < 0 ? "-" : ""}${bits}'d${
      Math.abs(data) * 10000
    };`;

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
    writeToFile(
      "./verilog-test-bench/initialization/primaryCapsKernel-initialization.txt",
      output
    );
  });
}

function generateVerilogDigitCapsWeightMatrixesInitialization(bits) {
  const format = (data, i, j, k, l) =>
    `io_digitCapsWeightMatrixes_${i}_${j}_${k}_${l} = ${
      data < 0 ? "-" : ""
    }${bits}'d${Math.abs(data) * 10000};`;

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
      writeToFile(
        "./verilog-test-bench/initialization/digitCapsWeightMatrixes-initialization.txt",
        output
      );
    }
  );
}

// generateRandomNumbers(64, 1, true);
// generatePokeTestForConv1Input();
// generatePokeTestForConv1Kernel();
// generatePokeTestForPrimaryCapsKernel();
// generatePokeTestForDigitCapsWeightMatrixes();
// generateVerilogInputDeclaration(19, 10, 10);
// generateVerilogConv1KernelDeclaration(19, 2, 4, 4);
// generateVerilogPrimaryCapsKernelDeclaration(22, 2, 4, 4);
// generateVerilogDigitCapsWeightMatrixesDeclaration(20, 4, 2, 2, 4);
// generateVerilogOutputDeclaration(31, 2);
// generateVerilogInputInitialization(19);
// generateVerilogConv1KernelInitialization(19);
// generateVerilogPrimaryCapsKernelInitialization(22);
// generateVerilogDigitCapsWeightMatrixesInitialization(20);
