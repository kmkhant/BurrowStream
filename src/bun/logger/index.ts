import pino from "pino";
import pinoPretty from "pino-pretty";

// Instantiate the stream directly so no dynamic worker path resolution is required
const prettyStream = pinoPretty({
  colorize: true,
  sync: true, // Forces synchronous writing inside the main thread wrapper
});

const logger = pino(prettyStream);

export default logger;
