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
});


client.on('error', (err) => {
  logger.error(`Erreur MQTT: ${err.message}`);
});

client.on('message', (topic, message) => {
  console.log("MESSAGE BRUT REÇU:", topic, message.toString());
});

module.exports = client;
