import { prisma } from "../lib/prisma.js"

import buildBreadcrumbs from "../utils/build-breadcrumbs.js"
import { formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"

async function getIndex(req, res, next) {
	let folders = []
	let files = []
	let breadcrumbs = []

	if (req.isAuthenticated()) {
		const ownerId = req.user.id

		try {
			const rootFolders = await prisma.folder.findMany({
				where: {
					AND: [{ ownerId }, { parentId: null }],
				},
				select: { id: true, name: true, modifiedAt: true },
			})

			folders = rootFolders.map(({ id, name, modifiedAt }) => ({
				id,
				name,
				dateModified: formatDateModified(modifiedAt),
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
				},
			})

			files = rootFiles.map(({ id, name, size, modifiedAt }) => ({
				id,
				name,
				size: formatBytes(size),
				dateModified: formatDateModified(modifiedAt),
			}))

			breadcrumbs = await buildBreadcrumbs(null)
		} catch (err) {
			return next(err)
		}
	}

	res.render("index", { folders, files, breadcrumbs })
}

export { getIndex }
