
import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

type ErrorCallback = (err: GenkitError) => void;
const errorCallbacks = new Set<ErrorCallback>();

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  evalStore: 'firebase',
  // Intercepts errors and logs them to the console.
  errorCallback: (err: GenkitError) => {
    for (const cb of errorCallbacks) {
      cb(err);
    }
    console.error(`[${err.code || 'UNKNOWN'}] ${err.name}`, err);
  },
});

export function onError(cb: ErrorCallback) {
  errorCallbacks.add(cb);
  return () => {
    errorCallbacks.delete(cb);
  };
}

// Re-export zod for convenience.
export {z} from 'zod';

export function isGenkitError(
  err: any,
  code?: GenkitErrorCode
): err is GenkitError {
  return (
    err.isGenkitError &&
    (code === undefined || (err.code && err.code === code))
  );
}
