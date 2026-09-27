import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadPyodide } from "pyodide";

const indexURL = new URL(".", import.meta.resolve("pyodide/package.json"));
// Only these trusted bundled programs execute; repository content is stdin data.
const runtime = await loadPyodide({
  indexURL: fileURLToPath(indexURL),
  stdout: () => {},
  stderr: () => {},
});
const sources = Object.fromEntries(
  await Promise.all(
    ["inspect", "preview", "neighborhood", "calls"].map(async (name) => [
      name,
      await readFile(new URL(`../assets/python/${name}.py`, import.meta.url), "utf8"),
    ]),
  ),
);
runtime.globals.set("helper_sources_json", JSON.stringify(sources));
runtime.runPython(`import io, json, sys, contextlib
helper_programs = {name: compile(source, name, 'exec') for name, source in json.loads(helper_sources_json).items()}
def run_helper(name, request):
    previous = sys.stdin
    output = io.StringIO()
    try:
        sys.stdin = io.StringIO(request)
        with contextlib.redirect_stdout(output):
            exec(helper_programs[name], {'__name__': '__main__'})
        return json.dumps({'result': json.loads(output.getvalue())})
    except Exception as error:
        return json.dumps({'sourceError': type(error).__name__})
    finally:
        sys.stdin = previous
`);
process.on("message", ({ id, helper, input }) => {
  try {
    runtime.globals.set("helper_name", helper);
    runtime.globals.set("helper_input", input);
    process.send({
      id,
      ...JSON.parse(runtime.runPython("run_helper(helper_name, helper_input)")),
    });
  } catch (error) {
    process.send({ id, error: String(error) });
  }
});

// The parent may exit with an idle interpreter; do not leave an orphan process.
process.on("disconnect", () => process.exit(0));
