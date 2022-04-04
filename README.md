# CLogTS

A simple, colorful logger for JS/TS projects.

## Currently includes:

-   Customizable logger names
-   Toggle-able colors
-   Automatic log file output (can be disabled)
-   Switching between UTC and local time logging

## How to use

```ts
import Logger from "clogts"

const logger = new Logger("my-logger")

logger.info("Console message!")
logger.warn("Warning message.")
logger.error("Error message...")
```

## Settings customization

```ts
import Logger from "clogts"

Logger.enableColor = false // default 'true'
Logger.enableOutput = false // default 'true'
Logger.outputFolder = "log/" // default 'logs/'
Logger.useLocalTime = true // default 'true'
```
