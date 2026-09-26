# Provider support choices

No unplanned product choice has been made in slice 1. The SDK pin, endpoint/model
presets, external routing seam and immutable reference were specified. Probe file
names and test layout are delegated implementation discretion.

The routing fixture preserves the SDK's original body instead of converting it
to a stream. This is a correctness fix within the specified transport contract,
not an additional product behavior. Further passes append only decisions not
already made or delegated by the plan.
