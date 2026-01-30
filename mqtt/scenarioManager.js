const logger = require('./logger');

let currentScenario = null;
let currentMissionIndex = 0;

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

module.exports = {
  loadScenario,
  completeMission
};
