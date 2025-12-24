import {
	Cloud,
	Download,
	FileUp,
	FolderPlus,
	Info,
	LayoutGrid,
	List,
	LogOut,
	PencilLine,
	Trash2,
	X,
} from "lucide-static"
import { addIconClasses } from "../utils/icons.js"

export function setHeaderIcon(_req, res, next) {
	const headerIcon = addIconClasses(Cloud, ["text-primary", "fill-primary"])
	res.locals.headerIcon = headerIcon
	next()
}

export function setIndexHeaderIcons(_req, res, next) {
	const newFolderIcon = addIconClasses(FolderPlus, ["size-5"])
	const [listIcon, gridIcon] = [List, LayoutGrid].map((icon) =>
		addIconClasses(icon, ["text-paragraph", "transition"]),
	)
	res.locals.newFolderIcon = newFolderIcon
	res.locals.listIcon = listIcon
	res.locals.gridIcon = gridIcon
	next()
}

export function setUploadIcon(_req, res, next) {
	const uploadIcon = addIconClasses(FileUp, ["text-paragraph"])
	res.locals.uploadIcon = uploadIcon
	next()
}

export function setLogoutIcon(_req, res, next) {
	const logoutIcon = addIconClasses(LogOut, ["text-paragraph"])
	res.locals.logoutIcon = logoutIcon
	next()
}

export function setFileRowIcons(_req, res, next) {
	const [detailsIcon, renameIcon, downloadIcon] = [
		Info,
		PencilLine,
		Download,
	].map((icon) =>
		addIconClasses(icon, [
			"text-paragraph",
			"hover:text-primary",
			"transition-[color,_opacity]",
			"size-5",
		]),
	)
	res.locals.detailsIcon = detailsIcon
	res.locals.renameIcon = renameIcon
	res.locals.downloadIcon = downloadIcon
	res.locals.deleteIcon = addIconClasses(Trash2, [
		"text-red-500",
		"transition-opacity",
		"size-5",
	])
	next()
}

export function setFileDetailsIcons(_req, res, next) {
	const [renameIcon, downloadIcon, xIcon] = [PencilLine, Download, X].map(
		(icon) => addIconClasses(icon, ["transition-opacity", "size-5"]),
	)
	res.locals.renameIcon = renameIcon
	res.locals.downloadIcon = downloadIcon
	res.locals.xIcon = xIcon
	next()
}
