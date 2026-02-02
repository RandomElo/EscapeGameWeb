const mqtt = require('mqtt');
const config = require('./config');
const logger = require('./logger');
const scenarioManager = require('./scenarioManager');


const client = mqtt.connect(config.mqtt.host, {
  username: config.mqtt.username,
  password: config.mqtt.password
});

client.on('connect', () => {
  logger.info('ENGINE connecté au broker MQTT');
  client.subscribe(`${config.mqtt.baseTopic}/#`);
});

client.on('message', (topic, message) => {
  const msg = message.toString();
  logger.info(`MQTT | ${topic} | ${msg}`);

  if (topic === 'escape/scenario/config') {
    try {
      const scenario = JSON.parse(msg);
      scenarioManager.loadScenario(scenario);
    } catch (err) {
      logger.error('Scénario invalide reçu');
    }
  }

  const configMatch = topic.match(/^escape\/mission\/(\d+)\/config$/);
  if (configMatch) {
    const missionId = configMatch[1];
    try {
      const missionConfig = JSON.parse(msg);
      scenarioManager.updateMissionConfig(missionId, missionConfig);
    } catch (err) {
      logger.error(`Config mission ${missionId} invalide`);
    }
  }
});

client.on('error', (err) => {
  logger.error(`Erreur MQTT: ${err.message}`);
});

module.exports = client;
