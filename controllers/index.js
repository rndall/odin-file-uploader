import { prisma } from "../lib/prisma.js"
import { formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"

async function getIndex(req, res, next) {
	let folders = []
	let files = []

	if (req.isAuthenticated()) {
		const ownerId = req.user.id

		try {
			const rootFolders = await prisma.folder.findMany({
				where: {
					AND: [{ ownerId }, { parentId: null }],
				},
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
				include: { owner: true },
			})

			files = rootFiles.map(({ id, name, size, modifiedAt }) => ({
				id,
				name,
				size: formatBytes(size),
				dateModified: formatDateModified(modifiedAt),
			}))
		} catch (err) {
			next(err)
		}
	}

	res.render("index", { folders, files })
}

export { getIndex }
