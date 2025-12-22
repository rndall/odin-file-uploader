import { prisma } from "../lib/prisma.js"

import {
	setFileRowIcons,
	setNewFolderIcon,
	setUploadIcon,
} from "../middlewares/icons.js"

import buildBreadcrumbs from "../utils/build-breadcrumbs.js"
import { formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"
import { getFileTypeIcon } from "../utils/icons.js"

const getIndex = [
	setNewFolderIcon,
	setUploadIcon,
	setFileRowIcons,
	async (req, res, next) => {
		if (!req.isAuthenticated()) {
			res.redirect("/log-in")
		}

		const ownerId = req.user.id

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
				dateModified: formatDateModified(folder.modifiedAt),
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
				dateModified: formatDateModified(file.modifiedAt),
				type: "files",
				icon: getFileTypeIcon(file),
			}))

			const breadcrumbs = await buildBreadcrumbs(null)

			res.render("index", { files: [...folders, ...files], breadcrumbs })
		} catch (err) {
			next(err)
		}
	},
]

export { getIndex }
