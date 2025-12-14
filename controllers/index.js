import { prisma } from "../lib/prisma.js"
import { formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"

async function getIndex(req, res, next) {
	let folders = []
	let files = []

	if (req.isAuthenticated()) {
		const ownerId = req.user.id

		try {
			folders = await prisma.folder.findMany({
				where: { ownerId },
			})

			folders = folders.map(({ id, name, modifiedAt }) => ({
				id,
				name,
				dateModified: formatDateModified(modifiedAt),
			}))

			files = await prisma.file.findMany({
				where: { ownerId },
				include: { owner: true },
			})

			files = files.map(({ id, name, size, modifiedAt }) => ({
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
