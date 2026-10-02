import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  isValidPort,
  parsePort,
  parseCliArgs,
  DevPreviewError
} from '../src/config/config.js';

describe('Config & Port Parsing', () => {
  it('validates port range correctly', () => {
    assert.equal(isValidPort(80), true);
    assert.equal(isValidPort(3000), true);
    assert.equal(isValidPort(65535), true);
    assert.equal(isValidPort(1), true);

    assert.equal(isValidPort(0), false);
    assert.equal(isValidPort(-1), false);
    assert.equal(isValidPort(65536), false);
    assert.equal(isValidPort(3000.5), false);
    assert.equal(isValidPort(NaN), false);
    assert.equal(isValidPort('3000'), false);
    assert.equal(isValidPort(null), false);
    assert.equal(isValidPort(undefined), false);
  });

  it('parses valid port string or number', () => {
    assert.equal(parsePort(3000), 3000);
    assert.equal(parsePort('5173'), 5173);
    assert.equal(parsePort('8080'), 8080);
  });

  it('throws DevPreviewError on invalid port', () => {
    assert.throws(
      () => parsePort('abc'),
      (err: unknown) => {
        assert.ok(err instanceof DevPreviewError);
        assert.match(err.message, /Invalid port: "abc"/);
        return true;
      }
    );

    assert.throws(
      () => parsePort(0),
      (err: unknown) => {
        assert.ok(err instanceof DevPreviewError);
        return true;
      }
    );

    assert.throws(
      () => parsePort(70000),
      (err: unknown) => {
        assert.ok(err instanceof DevPreviewError);
        return true;
      }
    );
  });

  it('parses CLI arguments correctly', () => {
    const res1 = parseCliArgs(['--port', '3000']);
    assert.equal(res1.port, 3000);

    const res2 = parseCliArgs(['-p', '5173']);
    assert.equal(res2.port, 5173);

    const res3 = parseCliArgs(['--help']);
    assert.equal(res3.help, true);

    const res4 = parseCliArgs(['-h']);
    assert.equal(res4.help, true);

    const res5 = parseCliArgs(['--version']);
    assert.equal(res5.version, true);

    const res6 = parseCliArgs(['-v']);
    assert.equal(res6.version, true);

    const empty = parseCliArgs([]);
    assert.equal(empty.port, undefined);
    assert.equal(empty.help, undefined);
  });

  it('throws DevPreviewError on unknown CLI flags', () => {
    assert.throws(
      () => parseCliArgs(['--unknown-flag']),
      (err: unknown) => {
        assert.ok(err instanceof DevPreviewError);
        assert.match(err.message, /Failed to parse/);
        return true;
      }
    );
  });
});
