# Parser behavior

These tests cover source coordinates, Unicode byte boundaries, decorators,
comments, invalid-syntax fallback, structural class ownership and cancellation.
They exercise the bundled Python runtime and TypeScript parser directly, without
requiring a system Python installation or matching a historical spike.

Keep selected units tied to their immutable source snapshot. Splitting large
units must preserve source bytes, and duplicate declaration names must not attach
the wrong class context. A malformed source file may use text fallback; a broken
bundled runtime must surface a setup failure.

Run `bun run test:parser` for isolated Docker checks and packaged CLI coverage.
