// Strategy Pattern for Alerting
class P0AlertStrategy {
  execute(workItem) {
    console.log(`🚨 [P0 CRITICAL] ALERT fired for ${workItem.component_id} - Immediate response required!`);
    return { level: 'P0', channel: 'pagerduty', message: `CRITICAL: ${workItem.title}` };
  }
}

class P1AlertStrategy {
  execute(workItem) {
    console.log(`🔴 [P1 HIGH] ALERT fired for ${workItem.component_id}`);
    return { level: 'P1', channel: 'slack', message: `HIGH: ${workItem.title}` };
  }
}

class P2AlertStrategy {
  execute(workItem) {
    console.log(`🟡 [P2 MEDIUM] ALERT fired for ${workItem.component_id}`);
    return { level: 'P2', channel: 'email', message: `MEDIUM: ${workItem.title}` };
  }
}

class P3AlertStrategy {
  execute(workItem) {
    console.log(`🟢 [P3 LOW] ALERT logged for ${workItem.component_id}`);
    return { level: 'P3', channel: 'log', message: `LOW: ${workItem.title}` };
  }
}

// Severity → component type mapping
const COMPONENT_SEVERITY_MAP = {
  RDBMS: 'P0',
  MCP_HOST: 'P1',
  API: 'P1',
  QUEUE: 'P2',
  CACHE: 'P2',
  NOSQL: 'P2',
};

const STRATEGIES = { P0: new P0AlertStrategy(), P1: new P1AlertStrategy(), P2: new P2AlertStrategy(), P3: new P3AlertStrategy() };

const getSeverityForComponent = (componentType) => COMPONENT_SEVERITY_MAP[componentType] || 'P3';

const fireAlert = (workItem) => {
  const strategy = STRATEGIES[workItem.severity] || STRATEGIES['P3'];
  return strategy.execute(workItem);
};

module.exports = { fireAlert, getSeverityForComponent };