const logger = require('./logger');

let currentScenario = null;
let currentMissionIndex = 0;
let missionConfigs = {};

function loadScenario(scenario) {
  currentScenario = scenario;
  currentMissionIndex = 0;

  logger.info(`Scénario chargé: ${scenario.name}`);
  logger.info(`Ordre des missions: ${scenario.missions.join(' → ')}`);

  startNextMission();
}

function startNextMission() {
  if (!currentScenario) return;

  if (currentMissionIndex >= currentScenario.missions.length) {
    logger.info("Scénario terminé !");
    return;
  }

  const missionId = currentScenario.missions[currentMissionIndex];

  logger.info(`Démarrage mission ${missionId}`);
  require('./mqttClient').publish(`escape/mission/${missionId}/state`, "RUNNING");
}

function completeMission(missionId) {
  if (!currentScenario) return;

  const expectedMission = currentScenario.missions[currentMissionIndex];

  if (missionId == expectedMission) {
    logger.info(`Mission ${missionId} réussie`);
    require('./mqttClient').publish(`escape/mission/${missionId}/state`, "SUCCESS");

    currentMissionIndex++;
    setTimeout(startNextMission, 2000);
  }
}


function updateMissionConfig(missionId, config) {
  missionConfigs[missionId] = config;
  logger.info(`Config mission ${missionId} mise à jour: ${JSON.stringify(config)}`);
}

function getMissionConfig(missionId) {
  return missionConfigs[missionId];
}

module.exports = {
  loadScenario,
  completeMission,
  updateMissionConfig,
  getMissionConfig
};
