import { Telemetry } from '../telemetry';
// Backends preserve the same event contract.
export class BackendTelemetry extends Telemetry {
  recordEvent(name: string) {
    return super.recordEvent(name);
  }
}
