import assert from 'node:assert/strict';
import { validateDrvOutput } from './validate-drv-output.mjs';

function org(id, state, routeLevel = 'club') {
  return {
    id,
    organizationId: id,
    name: id,
    type: 'club',
    state,
    states: state ? [state] : [],
    contactRouteLevel: routeLevel
  };
}

function recipient(email = 'kontakt@example.org', routeLevel = 'club') {
  return { email, routeLevel };
}

{
  const publicData = {
    count: 3,
    organizations: [
      org('a', 'Schleswig-Holstein'),
      org('b', 'Hamburg', 'lrv'),
      { id: 'drv', organizationId: 'drv', name: 'DRV', type: 'drv', state: 'Niedersachsen', states: ['Niedersachsen'] }
    ]
  };
  const privateData = {
    recipients: {
      a: recipient('a@example.org', 'club'),
      b: recipient('lrv@example.org', 'lrv'),
      drv: recipient('drv@example.org', 'drv')
    }
  };
  const result = validateDrvOutput(publicData, privateData, { requiredStateCoverage: 1 });
  assert.equal(result.ok, true);
  assert.equal(result.metrics.stateCoverage, 1);
  assert.deepEqual(result.metrics.routeCounts, { club: 1, lrv: 1, drv: 1 });
}

{
  const publicData = {
    count: 2,
    organizations: [org('a', ''), org('b', 'Hamburg')]
  };
  const privateData = {
    recipients: {
      a: recipient(),
      b: recipient()
    }
  };
  const result = validateDrvOutput(publicData, privateData, { requiredStateCoverage: 0.98 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /state coverage/i);
}

{
  const publicData = {
    count: 1,
    organizations: [org('a', 'Schleswig-Holstein')]
  };
  const result = validateDrvOutput(publicData, { recipients: {} }, { requiredStateCoverage: 1 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /missing routing recipients/i);
}

{
  const publicData = {
    count: 1,
    organizations: [org('a', 'Schleswig-Holstein')]
  };
  const result = validateDrvOutput(
    publicData,
    { recipients: { a: recipient('not-an-email', 'club') } },
    { requiredStateCoverage: 1 }
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /invalid route\/email/i);
}

console.log('validate-drv-output tests passed');
