import { Config } from "@remotion/cli/config";

// WebGL needs a GPU-backed ANGLE context in headless Chrome; the default has none on macOS.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(4);
