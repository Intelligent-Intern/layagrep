import { Telemetry } from '../src/telemetry';
// Regression example: do not rename the caller's event.
export function testEventName() {
  return new Telemetry().recordEvent('opened').name === 'opened';
}
