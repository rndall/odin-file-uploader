import { extname } from "node:path"
import {
	Archive,
	Code,
	Cpu,
	Database,
	File,
	FileSpreadsheet,
	FileText,
	Folder,
	Image,
	Key,
	Link,
	Music,
	Video,
} from "lucide-static"

export function addIconClasses(icon, classes = []) {
	if (!classes.length) return icon

	return icon.replace(/class="([^"]*)"/, `class="$1 ${classes.join(" ")}"`)
}

export function getFileTypeIcon(file) {
	const { mimeType, name } = file

	const icons = {
		folder: addIconClasses(Folder, ["text-yellow-600", "fill-yellow-500"]),
		image: addIconClasses(Image, ["text-foreground", "fill-fuchsia-500"]),
		video: addIconClasses(Video, ["text-violet-600", "fill-violet-500"]),
		audio: addIconClasses(Music, ["text-pink-600"]),
		text: addIconClasses(FileText, ["text-foreground", "fill-slate-500"]),
		spreadsheet: addIconClasses(FileSpreadsheet, [
			"text-foreground",
			"fill-emerald-500",
		]),
		pdf: addIconClasses(FileText, ["text-foreground", "fill-red-500"]),
		archive: addIconClasses(Archive, ["text-foreground", "fill-amber-500"]),
		code: addIconClasses(Code, ["text-sky-600"]),
		exe: addIconClasses(Cpu, ["text-rose-600"]),
		db: addIconClasses(Database, ["text-teal-600"]),
		key: addIconClasses(Key, ["text-lime-600"]),
		link: addIconClasses(Link, ["text-cyan-600"]),
		file: addIconClasses(File, ["text-foreground", "fill-slate-500"]),
	}

	if (!mimeType) return icons.folder

	const ext = extname(name) || ""
	const is = (prefix) => mimeType.startsWith(prefix)

	if (is("image/")) return icons.image
	if (is("video/")) return icons.video
	if (is("audio/")) return icons.audio
	if (is("text/")) {
		if (mimeType === "text/markdown" || ext === ".md") return icons.text
		if (ext === ".csv") return icons.spreadsheet
		return icons.text
	}
	if (mimeType === "application/pdf") return icons.pdf
	if (
		mimeType === "application/zip" ||
		mimeType === "application/x-7z-compressed" ||
		mimeType === "application/x-tar" ||
		mimeType === "application/gzip" ||
		ext === ".zip" ||
		ext === ".7z" ||
		ext === ".tar" ||
		ext === ".gz"
	) {
		return icons.archive
	}
	if (mimeType === "application/json" || ext === ".json") return icons.code
	if (
		mimeType.includes("javascript") ||
		ext === ".js" ||
		ext === ".mjs" ||
		ext === ".ts"
	)
		return icons.code
	if (mimeType.includes("python") || ext === ".py") return icons.code
	if (
		mimeType.includes("xml") ||
		ext === ".xml" ||
		ext === ".html" ||
		ext === ".htm"
	)
		return icons.code
	if (
		mimeType.includes("spreadsheet") ||
		mimeType.includes("excel") ||
		ext === ".xls" ||
		ext === ".xlsx" ||
		ext === ".csv"
	)
		return icons.spreadsheet
	if (mimeType.includes("presentation") || ext === ".ppt" || ext === ".pptx")
		return icons.file
	if (
		mimeType.includes("msword") ||
		ext === ".doc" ||
		ext === ".docx" ||
		mimeType.includes("wordprocessingml")
	)
		return icons.text
	if (
		mimeType.includes("font") ||
		ext === ".ttf" ||
		ext === ".otf" ||
		ext === ".woff" ||
		ext === ".woff2"
	)
		return icons.text
	if (
		mimeType.includes("x-executable") ||
		ext === ".exe" ||
		ext === ".bin" ||
		ext === ".apk"
	)
		return icons.exe
	if (
		mimeType.includes("sql") ||
		ext === ".sql" ||
		mimeType.includes("database")
	)
		return icons.db
	if (
		mimeType.includes("certificate") ||
		ext === ".pem" ||
		ext === ".crt" ||
		ext === ".key"
	)
		return icons.key
	if (ext === ".lnk") return icons.link

	return icons.file
}
