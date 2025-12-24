import { matchedData } from "express-validator"
import { prisma } from "../lib/prisma.js"

import {
	setFileRowIcons,
	setIndexHeaderIcons,
	setUploadIcon,
} from "../middlewares/icons.js"
import validateResult from "../middlewares/validate-result.js"

import buildBreadcrumbs from "../utils/build-breadcrumbs.js"
import { formatDateModified, formatToNow } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"
import { getFileTypeIcon } from "../utils/icons.js"

import { validateLayout } from "../validators/index.js"

const getIndex = [
	setIndexHeaderIcons,
	setUploadIcon,
	setFileRowIcons,
	async (req, res, next) => {
		if (!req.isAuthenticated()) {
			res.redirect("/log-in")
		}

		const ownerId = req.user.id
		const layout = req.cookies?.layout ?? "list"
		const dateFormatter = layout === "list" ? formatDateModified : formatToNow

		try {
			const rootFolders = await prisma.folder.findMany({
				where: {
					AND: [{ ownerId }, { parentId: null }],
				},
				select: { id: true, name: true, modifiedAt: true },
			})

			const folders = rootFolders.map((folder) => ({
				id: folder.id,
				name: folder.name,
				dateModified: dateFormatter(folder.modifiedAt),
				type: "folders",
				icon: getFileTypeIcon(folder),
			}))

			const rootFiles = await prisma.file.findMany({
				where: {
					AND: [{ ownerId }, { folderId: null }],
				},
				select: {
					id: true,
					name: true,
					size: true,
					modifiedAt: true,
					owner: true,
					mimeType: true,
				},
			})

			const files = rootFiles.map((file) => ({
				id: file.id,
				name: file.name,
				size: formatBytes(file.size),
				dateModified: dateFormatter(file.modifiedAt),
				type: "files",
				icon: getFileTypeIcon(file),
			}))

			const breadcrumbs = await buildBreadcrumbs(null)

			res.render("index", {
				files: [...folders, ...files],
				breadcrumbs,
				layout,
			})
		} catch (err) {
			next(err)
		}
	},
]

const setLayout = [
	validateLayout,
	validateResult,
	async (req, res) => {
		if (req.errors) {
			return res.render("partials/errors", { errors: req.errors })
		}

		const { layout } = matchedData(req)
		const { url } = req.body
		res.cookie("layout", layout)
		res.redirect(url)
	},
]

export { getIndex, setLayout }
