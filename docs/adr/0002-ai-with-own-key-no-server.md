# AI calls go straight from the phone to Claude with the person's own API key

Turning a spoken Brain dump into Steps, and suggesting a tailored first move for "Make it smaller", needs an LLM. The person pastes their own Anthropic API key into Settings, where it is stored on the device only. The app then calls the Claude API directly from the browser. There is no server of our own. A proxy server was rejected because it would need hosting, secret management and abuse protection for an app with one user. The trade-off is that the app is not ready to share with people who have no key.

## Consequences

- Every AI feature has an offline or no-key fallback: the rule-based splitter for Brain dumps, and built-in first moves for "Make it smaller". The app never blocks on AI.
- Nothing is sent to Claude unless the person taps the button that sends it.
- Opening Do Now to other people later means revisiting this ADR, most likely by adding a small proxy.
