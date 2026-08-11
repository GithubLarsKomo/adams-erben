import assert from 'node:assert/strict';
import { validateDrvOutput } from './validate-drv-output.mjs';

function org(id, state, { routeLevel = 'club', hasDirectContact = true, type = 'club' } = {}) {
  return {
    id,
    organizationId: id,
    name: id,
    type,
    state,
    states: state ? [state] : [],
    hasDirectContact,
    contactRouteLevel: routeLevel
  };
}

function recipient(id, email = 'kontakt@example.org', routeLevel = 'club', routeOrganizationId = id) {
  return { organizationId: id, routeOrganizationId, email, routeLevel };
}

{
  const publicData = {
    count: 3,
    organizations: [
      org('a', 'Schleswig-Holstein'),
      org('b', 'Hamburg', { routeLevel: 'none', hasDirectContact: false }),
      org('drv', 'Niedersachsen', { routeLevel: 'drv', hasDirectContact: true, type: 'drv' })
    ]
  };
  const privateData = {
    recipients: {
      a: recipient('a', 'a@example.org', 'club'),
      drv: recipient('drv', 'drv@example.org', 'drv')
    }
  };
  const result = validateDrvOutput(publicData, privateData, { requiredStateCoverage: 1 });
  assert.equal(result.ok, true);
  assert.equal(result.metrics.stateCoverage, 1);
  assert.deepEqual(result.metrics.routeCounts, { club: 1, lrv: 0, drv: 1, none: 1 });
}

{
  const publicData = {
    count: 2,
    organizations: [org('a', ''), org('b', 'Hamburg')]
  };
  const privateData = {
    recipients: {
      a: recipient('a'),
      b: recipient('b')
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
  assert.match(result.errors.join('\n'), /missing direct recipients/i);
}

{
  const publicData = {
    count: 1,
    organizations: [org('a', 'Schleswig-Holstein', { routeLevel: 'none', hasDirectContact: false })]
  };
  const result = validateDrvOutput(
    publicData,
    { recipients: { a: recipient('a', 'a@example.org', 'lrv', 'lrv-sh') } },
    { requiredStateCoverage: 1 }
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /unexpected recipients/i);
}

{
  const publicData = {
    count: 1,
    organizations: [org('a', 'Schleswig-Holstein')]
  };
  const result = validateDrvOutput(
    publicData,
    { recipients: { a: recipient('a', 'not-an-email', 'club') } },
    { requiredStateCoverage: 1 }
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /invalid route\/email/i);
}

{
  const publicData = {
    count: 1,
    organizations: [org('a', 'Schleswig-Holstein')]
  };
  const result = validateDrvOutput(
    publicData,
    { recipients: { a: recipient('a', 'a@example.org', 'lrv', 'lrv-sh') } },
    { requiredStateCoverage: 1 }
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /indirect\/fallback routing/i);
}

console.log('validate-drv-output tests passed');
