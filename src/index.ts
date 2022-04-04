import Chalk from "chalk"
import FS from "fs"

const ANSIRegexp = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

export class Logger {
	private static __outputFolder = "logs/"
	public static readonly default = new Logger("default")
	public static enableColor = true
	public static enableOutput = true
	public static useLocalTime = true
	private readonly __infoStamp = Chalk.blueBright`(INFO)`
	private readonly __warnStamp = Chalk.yellowBright`(WARN)`
	private readonly __errorStamp = Chalk.redBright`(ERROR)`

	public constructor(public readonly name: string) {}

	private static get __dateData() {
		const d = new Date()

		if (this.useLocalTime)
			return {
				date: [d.getFullYear(), d.getMonth() + 1, d.getDate()],
				time: [d.getHours(), d.getMinutes(), d.getSeconds()],
			}
		else
			return {
				date: [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()],
				time: [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()],
			}
	}
	private static get __logFile() {
		const pad = (v: number[]) => v.map((n) => `${n}`.padStart(2, "0"))
		const { date, time } = this.__dateData
		return `${pad(date).join("-")}_${pad(time).join("-")}.txt`
	}
	private static get __logPath() {
		return `${this.outputFolder}${this.__logFile}`
	}
	public static get outputFolder() {
		return this.__outputFolder
	}
	public static set outputFolder(val) {
		if (!val.endsWith("/")) val += "/"
		this.__outputFolder = val
	}
	private get __timeStamp() {
		const join = (v: number[], s: string) => v.map((n) => `${n}`.padStart(2, "0")).join(s)
		const { date, time } = Logger.__dateData
		return Chalk.gray`[${join(date, "-")} ${join(time, ":")}]`
	}
	private get __nameStamp() {
		return Chalk.greenBright`(${this.name})`
	}

	private static __strip(text: string) {
		return text.replaceAll(ANSIRegexp, "").normalize().trim()
	}
	private __store(text: string) {
		if (!Logger.enableOutput) return
		const data = `${Logger.__strip(text)}\n`

		try {
			FS.mkdirSync(Logger.outputFolder, { recursive: true })
			FS.appendFileSync(Logger.__logPath, data, { encoding: "utf8" })
		} catch (error) {
			console.error(error)
		}
	}
	private __log(type: "info" | "error" | "warn", text: string) {
		const msg = `${this.__timeStamp} ${this[`__${type}Stamp`]} ${this.__nameStamp} ${text}`
		console.log(msg)
		this.__store(msg)
	}
	public info(...data: unknown[]) {
		return this.__log("info", data.join())
	}
	public warn(...data: unknown[]) {
		return this.__log("warn", data.join())
	}
	public error(...data: unknown[]) {
		return this.__log("error", data.join())
	}
}
export default Logger
