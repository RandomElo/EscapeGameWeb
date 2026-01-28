const logger = require('./logger');

let currentScenario = null;

function loadScenario(scenario) {
  currentScenario = scenario;
  logger.info(`Scénario chargé: ${scenario.name}`);
  logger.info(`Ordre des missions: ${scenario.missions.join(' → ')}`);
}

function getCurrentScenario() {
  return currentScenario;
}

module.exports = {
  loadScenario,
  getCurrentScenario
};
