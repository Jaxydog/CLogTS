# CLogTS

A (somewhat) simple, colorful logger for JS/TS projects.

## Currently includes:

-   [Customizable formatting](#adding-formatting)
-   [Personalized color schemes](#saving-custom-colors)
-   [Automatic log file output](#logger-settings) (can be disabled)

## Installation

```
npm i @jaxydog/clogts
```

```ts
import Logger from "@jaxydog/clogts"
// or if you prefer require 👉👉
// const { Logger } = require("@jaxydog/clogts")

// create your own logger instance
const logger_1 = new Logger()
// or use the default
const logger_2 = Logger.default
// can also be .cloned to copy logger stylings
const logger_3 = logger_1.clone()

logger_1.info("😀 Info message 😀")
logger_2.warn("⚠️ Warning message ⚠️")
logger_3.error("❌ Error message ❌")
```

## Adding formatting

### Saving custom colors

Colors are saved per-instance and can be given any name.
The color string can be any `ColorResolvable` string or object; supported types are Hex, HSL, or RGB strings, the plaintext name of the color (such as "red-bright", "yellow-dim" or "purple"), or an object that contains the format's required values.

```ts
import Logger, { Prop, Rule, Color } from "@jaxydog/clogts"

Logger.default.colors.create("color-1", "white-dim") // plaintext
Logger.default.colors.create("color-2", "#A0A0A0") // hex
Logger.default.colors.create("color-3", "hsl(0, 0%, 40%)") // hsl
Logger.default.colors.create("color-3", "rgb(80, 80, 80)") // rgb
Logger.default.colors.create("color-4", {
	// rgb object
	type: "rgb",
	values: [40, 40, 40],
})
```

### Custom properties

Custom properties are glorified string providers that contain color styling rules. The constructor must be passed a "level" parameter that indicates when the prop should be applied. This can be set to 0 for all levels, or 1-3 for info, warn, or error logs respectively. The parameter also accepts any value from the `Level` enum.

The property constructor also takes a rest parameter of [rules](#instance-rules) that determine the colors of the property.

```ts
import Logger, { Prop, Rule, Color } from "@jaxydog/clogts"

// adds a blue "i" surrounded by dark gray square brackets
Logger.default.props.create(
	1, // log level; this prop will only apply to info logs
	() => `<i>`,
	new Rule(/[<>]/g, "color-3"),
	new Rule(/i/, new Color("", "#6699ee"))
)
```

### Instance rules

Rules are objects that effectively paint strings based off of a regular expression. This process [is not perfect](#the-dangers-of-adding-duplicate-rules), so be cautious when adding multiple rules that contain the same characters.

Rule constructors take a color argument, which can be a string or a [color instance](#saving-custom-colors). If a string is provided, it will look for a color with a matching name within the logger instance. If one is not found, it will default to white.

Rules added to a specific instance rather than a property only apply to the logged message, ignoring all properties.

```ts
import Logger, { Prop, Rule, Color } from "@jaxydog/clogts"

new Rule(/success/i, new Color("", "green"))
Logger.default.rules.create(/\((.*?)\)/i, "color-2")
```

### The dangers of adding duplicate rules

<img src="https://cdn.discordapp.com/attachments/730389830877577267/967135799860674600/unknown.png">

## Logger settings

These are the configuration options offered by the logger.

```ts
import Logger from "@jaxydog/clogts"

Logger.enabled = false // disable logging entirely
Logger.store = false // disable file storage entirely
Logger.unsafe = true // will crash if a log cannot be saved
Logger.directory = "log_files/" // sets the output directory

const logger = new Logger()
logger.enabled = false // disables logging for *only* this logger
logger.store = false // disables file storage for *only* this logger
```
