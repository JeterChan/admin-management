const createModels = require('fruit-web-models');

let modelsInstance = null;

const initializeModels = (mongoose) => {
  if (modelsInstance) {
    console.warn('Models already initialized');
    return modelsInstance;
  }
  
  modelsInstance = createModels(mongoose);
  console.log('✅ Models initialized');
  return modelsInstance;
};

const getModels = () => {
  if (!modelsInstance) {
    throw new Error('Models not initialized. Make sure to call initializeModels() in your app startup.');
  }
  return modelsInstance;
};


module.exports = {
  initializeModels,
  getModels
};