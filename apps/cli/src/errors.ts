/** Only explicitly authored messages are safe to print; SDK/OS errors can contain secrets. */
export class CliError extends Error {}
