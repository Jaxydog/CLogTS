import Chalk from "chalk"
import DayJS from "dayjs"
import FS from "fs"

export module Colors {
	export type Name = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "white" | "gray" | "black"
	export type Brightness = "dim" | "bright"
	export type Format = "hex" | "hsl" | "rgb"
	export type HexDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "A" | "B" | "C" | "D" | "E" | "F"
	export type HexPair = `${HexDigit}${HexDigit}`

	export type NameString = `${Name}${"" | `-${Brightness}`}`
	export type HexString = `#${string | number}`
	export type HSLString = `hsl(${number},${"" | " "}${number}%,${"" | " "}${number}%)`
	export type RGBString = `rgb(${number},${"" | " "}${number},${"" | " "}${number})`

	export type Hex = Instance<"hex", HexPair>
	export type HSL = Instance<"hsl">
	export type RGB = Instance<"rgb">

	interface Instance<F extends Format, T extends number | string = number> {
		readonly type: F
		values: [T, T, T]
	}

	export type ColorInstance = Hex | HSL | RGB
	export type ColorString = NameString | HexString | HSLString | RGBString
	export type ColorResolvable = ColorInstance | ColorString

	const brightRGBAdditive = 60
	const hexRegExp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
	const hslRegExp = /^hsl\(\s*?(\d{1,3}),\s*?(\d{1,3})%,\s*?(\d{1,3})%\s*?\)$/i
	const rgbRegExp = /^rgb\(\s*?(\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})\s*?\)$/i
	const ansiRegExp = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

	export function resolveHexString(str: HexString) {
		return Chalk.hex(str)
	}
	export function resolveHSLString(str: HSLString) {
		const res = hslRegExp.exec(str)!
		const h = parseInt(res[1] ?? "0")
		const s = parseInt(res[2] ?? "50")
		const l = parseInt(res[3] ?? "100")
		return Chalk.hsl(h, s, l)
	}
	export function resolveRGBString(str: RGBString) {
		const res = rgbRegExp.exec(str)!
		const r = parseInt(res[1] ?? "255")
		const g = parseInt(res[2] ?? "255")
		const b = parseInt(res[3] ?? "255")
		return Chalk.rgb(r, g, b)
	}
	export function resolveNameString(str: NameString) {
		const bright = str.endsWith("-bright")
		const dim = str.endsWith("-dim")
		let name: string = str

		while (/-(bright|dim)/.test(name)) {
			name = name.replace(/-(bright|dim)/, "")
		}

		let {
			values: [r, g, b],
		} = getRGB(name as Name)

		if (bright) {
			r = brighten(r)
			g = brighten(g)
			b = brighten(b)
		}

		let output = Chalk.rgb(r, g, b)
		return dim ? output.dim : output
	}
	export function resolveString(color: ColorString) {
		if (hexRegExp.test(color)) return resolveHexString(color as HexString)
		else if (hslRegExp.test(color)) return resolveHSLString(color as HSLString)
		else if (rgbRegExp.test(color)) return resolveRGBString(color as RGBString)
		else return resolveNameString(color as NameString)
	}
	export function resolveInstance(color: Colors.ColorInstance) {
		switch (color.type) {
			case "hex": {
				return resolveString(`#${color.values.join("")}`)
			}
			case "rgb": {
				const [r, g, b] = color.values
				return resolveString(`rgb(${r}, ${g}, ${b})`)
			}
			case "hsl": {
				const [h, s, l] = color.values
				return resolveString(`hsl(${h}, ${s}%, ${l}%)`)
			}
		}
	}
	export function resolve(color: Colors.ColorResolvable) {
		if (typeof color === "string") return resolveString(color)
		else return resolveInstance(color)
	}
	export function strip(str: string) {
		return str.replace(ansiRegExp, "").normalize()
	}
	function getRGB(color: Colors.Name): Colors.RGB {
		switch (color) {
			case "red":
				return { type: "rgb", values: [220, 40, 40] }
			case "orange":
				return { type: "rgb", values: [220, 110, 40] }
			case "yellow":
				return { type: "rgb", values: [220, 220, 40] }
			case "green":
				return { type: "rgb", values: [40, 220, 40] }
			case "blue":
				return { type: "rgb", values: [40, 110, 220] }
			case "purple":
				return { type: "rgb", values: [165, 40, 220] }
			case "pink":
				return { type: "rgb", values: [220, 40, 165] }
			case "black":
				return { type: "rgb", values: [40, 40, 40] }
			case "white":
				return { type: "rgb", values: [220, 220, 220] }
			case "gray":
				return { type: "rgb", values: [110, 110, 110] }
		}
	}
	function brighten(n: number) {
		return Math.max(0, Math.min(255, Math.floor(n + brightRGBAdditive)))
	}
}
module Utility {
	export enum Level {
		All,
		Info,
		Warn,
		Error,
	}

	abstract class BaseComponent {
		public readonly id = Symbol(this.constructor.name)

		public toString() {
			return JSON.stringify(this)
		}
	}
	export class ColorComponent extends BaseComponent {
		public readonly name: string
		public readonly color: Colors.ColorResolvable

		public constructor(name: string, color: Colors.ColorResolvable) {
			super()
			this.name = name
			this.color = color
		}
	}
	export class PropComponent extends BaseComponent {
		public readonly level: Level
		public readonly func: () => string
		public readonly rules: RuleComponent[]

		public constructor(level: Level, func: () => string, ...rules: RuleComponent[]) {
			super()
			this.level = level
			this.func = func
			this.rules = rules
		}
	}
	export class RuleComponent extends BaseComponent {
		public readonly color: ColorComponent | string
		public readonly match: RegExp

		public constructor(match: RegExp, color: ColorComponent | string) {
			super()
			this.color = color
			this.match = match
		}
	}

	abstract class BaseRegistry<T extends BaseComponent, A extends any[], I = symbol> {
		protected _list: Map<symbol, T> = new Map()

		public get active() {
			return [...this._list.values()]
		}

		public abstract create(...args: A): symbol
		public abstract delete(identifier: I): boolean
		public abstract fetch(identifier: I): T | undefined
	}
	export class ColorRegistry extends BaseRegistry<
		ColorComponent,
		ConstructorParameters<typeof ColorComponent>,
		string
	> {
		public create(name: string, color: Colors.ColorResolvable) {
			const value = new ColorComponent(name, color)
			this._list.set(value.id, value)
			return value.id
		}
		public delete(name: string) {
			const id = this.__findId(name)
			return !!id && this._list.delete(id)
		}
		public fetch(name: string) {
			const id = this.__findId(name)
			if (!id) return new ColorComponent("", "white")
			return this._list.get(id)
		}
		private __findId(name: string) {
			const index = this.active.findIndex((c) => c.name === name)
			return [...this._list.keys()][index]
		}
	}
	export class PropRegistry extends BaseRegistry<PropComponent, ConstructorParameters<typeof PropComponent>> {
		public create(level: Level, func: () => string, ...rules: RuleComponent[]) {
			const value = new PropComponent(level, func, ...rules)
			this._list.set(value.id, value)
			return value.id
		}
		public delete(id: symbol) {
			return this._list.delete(id)
		}
		public fetch(id: symbol) {
			return this._list.get(id)
		}
	}
	export class RuleRegistry extends BaseRegistry<RuleComponent, ConstructorParameters<typeof RuleComponent>> {
		public create(match: RegExp, color: string | ColorComponent) {
			const value = new RuleComponent(match, color)
			this._list.set(value.id, value)
			return value.id
		}
		public delete(id: symbol) {
			return this._list.delete(id)
		}
		public fetch(id: symbol) {
			return this._list.get(id)
		}
	}
}
class Logger {
	public static readonly default = new Logger()
	public static enabled = true
	public static store = true
	public static unsafe = false
	private static readonly __file = DayJS().format("YYYY-MM-DD_HH-mm-ss[.txt]")
	private static __directory = "logs/"

	public readonly colors = new Utility.ColorRegistry()
	public readonly props = new Utility.PropRegistry()
	public readonly rules = new Utility.RuleRegistry()
	public enabled = true
	public store = true

	public static get directory() {
		return this.__directory
	}
	public static set directory(value) {
		if (!(value.endsWith("/") || value.endsWith("\\"))) {
			value += "/"
		}
		this.__directory = value
	}

	public clone() {
		const logger = new Logger()
		logger.enabled = this.enabled

		for (const { color, name } of this.colors.active) {
			logger.colors.create(name, color)
		}
		for (const { func, level } of this.props.active) {
			logger.props.create(level, func)
		}
		for (const { color, match } of this.rules.active) {
			logger.rules.create(match, color)
		}

		return logger
	}
	public error(...data: any[]) {
		this.__output(Utility.Level.Error, this.__genLog(Utility.Level.Error, data.join()))
	}
	public info(...data: any[]) {
		this.__output(Utility.Level.Info, this.__genLog(Utility.Level.Info, data.join()))
	}
	public warn(...data: any[]) {
		this.__output(Utility.Level.Warn, this.__genLog(Utility.Level.Warn, data.join()))
	}
	private __appendLog(log: string) {
		try {
			const dir = this.__ensureDir()
			const path = `${Logger.__directory}${Logger.__file}`
			const data = `${Colors.strip(log)}\n`
			FS.appendFileSync(path, data, { encoding: "utf8" })
			return dir
		} catch (error) {
			console.error(error)
			return false
		}
	}
	private __applyRules(text: string, ...rules: Utility.RuleComponent[]) {
		for (const { color, match } of rules) {
			const component = typeof color === "string" ? this.colors.fetch(color) : color
			const resolved = component ? Colors.resolve(component.color) : Colors.resolve("white")
			text = text.replace(match, (s) => resolved`${Colors.strip(s)}`)
		}
		return text
	}
	private __ensureDir() {
		try {
			FS.mkdirSync(Logger.directory, { recursive: true })
			return true
		} catch (error) {
			console.error(error)
			return false
		}
	}
	private __genHeader(level: Utility.Level) {
		const props =
			level === Utility.Level.All
				? this.props.active
				: this.props.active.filter((p) => p.level === level || p.level === Utility.Level.All)
		let output = ""

		for (const { func, rules } of props) {
			output += `${this.__applyRules(func(), ...rules)} `
		}

		return output
	}
	private __genLog(level: Utility.Level, message: string) {
		return `${this.__genHeader(level)}${this.__applyRules(message, ...this.rules.active)}`
	}
	private __output(level: Utility.Level, log: string) {
		if (!this.enabled || !Logger.enabled) return

		switch (level) {
			case Utility.Level.Info:
				console.info(log)
				break
			case Utility.Level.Warn:
				console.warn(log)
				break
			case Utility.Level.Error:
				console.error(log)
				break
			case Utility.Level.All:
				console.log(log)
				break
		}

		if (Logger.store && this.store && !this.__appendLog(log) && Logger.unsafe) throw "Error saving file!"
	}
}

export default Logger
export const Color = Utility.ColorComponent
export const Prop = Utility.PropComponent
export const Rule = Utility.RuleComponent
export const Level = Utility.Level
