import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"

async function buildBreadcrumbs(folderId) {
	const crumbs = [{ id: null, name: "My Files", url: "/" }]

	try {
		const stack = []
		let currFolderId = folderId
		while (currFolderId) {
			const folder = await prisma.folder.findUnique({
				where: { id: currFolderId },
				select: { id: true, name: true, parentId: true },
			})

			if (!folder) {
				throw new CustomNotFoundError("Folder not found!")
			}

			stack.unshift({
				id: folder.id,
				name: folder.name,
				url: `/folders/${folder.id}`,
			})
			currFolderId = folder.parentId
		}

		crumbs.push(...stack)
	} catch (err) {
		console.error("Error building breadcrumbs:", { folderId, err })
		throw err
	}

	return crumbs
}

export default buildBreadcrumbs
