// Events preserve the caller's name.
export class Telemetry {
  recordEvent(name: string) {
    return { name, recorded: true };
  }
}
