const fs = require('fs');

function createFile(fileName) {
  const dir = './benchmarkResult';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFile(`./benchmarkResult/${fileName}.txt`, '', function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
}

function writeFile(fileName, result, totalTime) {
  var file = fs.createWriteStream(`./benchmarkResult/${fileName}.txt`);
  file.on('error', function (err) {
    console.log(err);
  });
  file.write(`Total Time Taken ${totalTime} \n`);
  result.forEach(function (v) {
    file.write(v + '\n');
  });
  file.end();
}

async function writeResult(fileName, result, totalTime) {
  await createFile(fileName);
  await writeFile(fileName, result, totalTime);
}

module.exports = {
  writeResult,
};
