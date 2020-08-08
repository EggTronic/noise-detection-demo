const brain = require('brain.js');

exports.train = function (noiseDataSet, normalDataSet) {
  const net = new brain.NeuralNetwork();

  let trainningData = [];

  noiseDataSet.forEach(data => {
    trainningData.push(
      { input: data, output: [1]}
    )
  });
  
  normalDataSet.forEach(data => {
    trainningData.push(
      { input: data, output: [0]}
    )
  });

  net.train(trainningData);

  return net;
}