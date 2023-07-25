const fs = require("fs");

const INPUT_WIDTH = 7;
const INPUT_HEIGHT = 7;
const KERNEL_WIDTH = 4;
const KERNEL_HEIGHT = 4;
const CHANNEL_COUNT = 2;

async function readData(path) {
  const data = fs.readFileSync(path, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return await JSON.parse(data);
}

function crawl(input, kernel, channelNumber, inputY, inputX) {
  let output = 0;
  for (let i = 0; i < KERNEL_HEIGHT; i++) {
    for (let j = 0; j < KERNEL_WIDTH; j++) {
      output += kernel[channelNumber][i][j] * input[inputY + i][inputX + j];
    }
  }
  return output;
}

let output = "";

readData("../inputs/conv1OutputAfterRelu.json").then((input) => {
  readData("../inputs/primaryCapsKernel.json").then((kernel) => {
    for (let c = 0; c < CHANNEL_COUNT; c++) {
      for (let i = 0; i < INPUT_HEIGHT - KERNEL_HEIGHT + 1; i += 2) {
        for (let j = 0; j < INPUT_WIDTH - KERNEL_WIDTH + 1; j += 2) {
          const result = crawl(input[c], kernel, c, i, j);
          output += result + ",";
        }
        output += "\n";
      }
      output += "\n";
    }
    fs.writeFile("../outputs/primaryCapsOutput.txt", output, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
});