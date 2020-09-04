
const load = require('audio-loader');
const utils = require('audio-buffer-utils'); // 这个uit 库提供了noise函数可以生成噪音片段 -> 可用于生成噪音数据集
const train = require('./train');

const SAMPLE_SIZE = 64; // 选择音频数据长度
// 此处可以加入更多配置。。。
// 数据格式化 - 清洗数据 
// 筛选特征集 （音频长度，音量）

main();

async function main() {
  console.log('\n=========== 加载数据 =========== ');
  const [noiseDataSet, normalDataSet] = await prepareTrainningData();
  console.log('加载完成');
  console.log('\n=========== 训练模型 =========== ');
  console.log('模型: 全连接神经网络');
  console.log('模型输出: 0 ~ 1');
  console.log('0 - 表示正常语音');
  console.log('1 - 表示噪音');
  model = trainModel(noiseDataSet, normalDataSet);
  console.log('训练完成');
  console.log('\n=========== 测试结果 =========== ');
  test(model);
}

async function prepareTrainningData() {
  // 导入数据集
  const noiseAudio = await load({ audio: 'dataset/noise/1.mp3' });
  const normalAudio = await load({ audio: 'dataset/normal/0.mp3' });

  // 此处获取两者音频的最小长度为训练最大样本
  const minLength = Math.min(noiseAudio.audio.length, normalAudio.audio.length);

  // 将数据集切片放入数据集
  let noiseData, normalData;
  const noiseDataSet = [];
  const normalDataSet = [];
  let step = 0;
  
  // 此处需要注意单双声道问题
  while (step < minLength) {
    noiseData = utils.slice(noiseAudio.audio, 0 + step, SAMPLE_SIZE + step)._channelData[1];
    noiseDataSet.push(noiseData);

    normalData = utils.slice(normalAudio.audio, 0 + step, SAMPLE_SIZE + step)._channelData[0];
    normalDataSet.push(normalData);
    
    step += SAMPLE_SIZE;
  }

  return [noiseDataSet, normalDataSet];
}

// 执行训练
function trainModel(noiseDataSet, normalDataSet) {
  const model = train.train(noiseDataSet, normalDataSet);
  return model;
}

// 执行测试
async function test(model) {
  // 加载测试数据
  const testAudio = await load({ audio: 'dataset/test/test.mp3' });
  const noiseAudio = await load({ audio: 'dataset/noise/1.mp3' });
  const normalAudio = await load({ audio: 'dataset/normal/0.mp3' });

  // 随机选取样本区间
  let position1 = 3000 * Math.random();
  let position2 = 3000 * Math.random();
  let position3 = 3000 * Math.random();

  // 选取样本
  let testData = utils.slice(testAudio.audio, position1, position1 + SAMPLE_SIZE)._channelData[0];
  let noiseData = utils.slice(noiseAudio.audio, position2, position2 + SAMPLE_SIZE)._channelData[1];
  let normalData = utils.slice(normalAudio.audio, position3, position3 + SAMPLE_SIZE)._channelData[0];

  // console.log(testData, noiseData, normalData);

  // 结果
  console.log('测试数据集 - 噪音(期望 = 1): ' + model.run(testData));
  console.log('训练数据集 - 噪音(期望 = 1): ' + model.run(noiseData));
  console.log('训练数据集 - 人声(期望 = 0): '+ model.run(normalData));
}

