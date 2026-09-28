import { describe, expect, it } from 'vitest';
import { verifySep30, SERVER_UNREACHABLE_RULE, INVALID_SIGNER_RESPONSE_RULE, IDENTITY_SCHEMA_MISMATCH_RULE } from '../../src/protocols/sep30.js';

describe('SEP-30 recovery signer multi-party identity and transaction signing validator', () => {
  const recoveryServer = 'https://recovery.example.com';
  const doc = {
    RECOVERY_SERVER: recoveryServer,
    CURRENCIES: [
      {
        code: 'USD',
        issuer: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSBRTC4TQBXXK2ZBDUFLYWWDZDT',
      },
    ],
  };

  const validIdentityResponse = {
    identity: {
      signers: ['GBDSEO35ZC5EZIAXYQU5UQZ743JVFVZ3JAR256KVYV44JT2VYLHOQ3J5'],
    },
  };

  const validInfoResponse = {
    identity: {
      signers: ['GBDSEO35ZC5EZIAXYQU5UQZ743JVFVZ3JAR256KVYV44JT2VYLHOQ3J5', 'GCMIMQCQDAQZB2D2J3H6X7A5C3D5E6F7G8H9I0JKL'],
    },
  };

  it('passes cleanly when recovery server returns valid signers', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/accounts')) {
        return new Response(JSON.stringify(validIdentityResponse), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics).toEqual([]);
  });

  it('passes cleanly when recovery server returns multiple valid signers', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/accounts')) {
        return new Response(JSON.stringify(validInfoResponse), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics).toEqual([]);
  });

  it('asserts sep30/invalid-signer-response when signers contain invalid Ed25519 key', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/accounts')) {
        return new Response(JSON.stringify({
          identity: {
            signers: ['invalid-key', 'GBDSEO35ZC5EZIAXYQU5UQZ743JVFVZ3JAR256KVYV44JT2VYLHOQ3J5'],
          },
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics.some((d) => d.rule === INVALID_SIGNER_RESPONSE_RULE)).toBe(true);
  });

  it('asserts sep30/invalid-signer-response when signers is not an array', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/accounts')) {
        return new Response(JSON.stringify({
          identity: {
            signers: 'not-an-array',
          },
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics.some((d) => d.rule === INVALID_SIGNER_RESPONSE_RULE)).toBe(true);
  });

  it('asserts sep30/server-unreachable when server is unreachable', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 500 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics.some((d) => d.rule === SERVER_UNREACHABLE_RULE)).toBe(true);
  });

  it('asserts sep30/server-unreachable when network error occurs', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      throw new Error('ECONNREFUSED Connection refused');
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics.some((d) => d.rule === SERVER_UNREACHABLE_RULE)).toBe(true);
  });

  it('asserts sep30/identity-schema-mismatch when identity schema is missing', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/accounts')) {
        return new Response(JSON.stringify({}), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics.some((d) => d.rule === IDENTITY_SCHEMA_MISMATCH_RULE)).toBe(true);
    expect(diagnostics[0]?.severity).toBe('warning');
  });

  it('asserts sep30/invalid-signer-response when signer is not a string', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/accounts')) {
        return new Response(JSON.stringify({
          identity: {
            signers: [123, true, null],
          },
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }) as unknown as typeof fetch;

    const diagnostics = await verifySep30(doc, fetchImpl);
    expect(diagnostics.some((d) => d.rule === INVALID_SIGNER_RESPONSE_RULE)).toBe(true);
  });
});