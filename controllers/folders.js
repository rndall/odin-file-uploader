import multer from "multer"
import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"
import { formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"

const upload = multer({ dest: "./public/data/uploads/" })

async function createFolderGet(_req, res) {
	res.render("form", {
		title: "New Folder",
		heading: "New Folder",
		action: "/folders",
		defaultValue: "Untitled folder",
		submitBtn: "Create",
	})
}

async function createFolderPost(req, res, next) {
	const { name } = req.body
	const { id } = req.user

	try {
		await prisma.folder.create({
			data: {
				name,
				owner: { connect: { id } },
			},
		})
		res.redirect("/")
	} catch (err) {
		next(err)
	}
}

async function deleteFolder(req, res, next) {
	const { id } = req.params

	if (!id) {
		throw new CustomNotFoundError("Folder not found!")
	}

	try {
		await prisma.folder.delete({ where: { id } })
		res.redirect("/")
	} catch (err) {
		next(err)
	}
}

async function renameFolderGet(req, res, next) {
	const { id } = req.params

	if (!id) {
		throw new CustomNotFoundError("Folder not found!")
	}

	try {
		const folder = await prisma.folder.findUnique({ where: { id } })
		res.render("form", {
			title: "Rename Folder",
			heading: "Rename",
			defaultValue: folder.name,
			submitBtn: "OK",
		})
	} catch (err) {
		next(err)
	}
}

async function renameFolderPost(req, res, next) {
	const { id } = req.params
	const { name } = req.body

	if (!id) {
		throw new CustomNotFoundError("Folder not found!")
	}

	try {
		await prisma.folder.update({
			where: { id },
			data: { name },
		})
		res.redirect("/")
	} catch (err) {
		next(err)
	}
}

async function getFolderById(req, res, next) {
	const { id } = req.params

	if (!id) {
		throw new CustomNotFoundError("Folder not found!")
	}

	const baseLink = `${req.originalUrl}/children`
	const fileUploadFormAction = `/folders/${id}/files`

	try {
		const folder = await prisma.folder.findUnique({
			where: { id },
			include: {
				children: true,
				files: true,
			},
		})

		const folders = folder.children.map(({ id, name, modifiedAt }) => ({
			id,
			name,
			dateModified: formatDateModified(modifiedAt),
		}))

		const files = folder.files.map(({ id, name, size, modifiedAt }) => ({
			id,
			name,
			size: formatBytes(size),
			dateModified: formatDateModified(modifiedAt),
		}))

		res.render("index", { folders, files, baseLink, fileUploadFormAction })
	} catch (err) {
		next(err)
	}
}

async function createChildFolderGet(req, res) {
	const { id } = req.params

	if (!id) {
		throw new CustomNotFoundError("Folder not found!")
	}

	res.render("form", {
		title: "New Folder",
		heading: "New Folder",
		action: `/folders/${id}/children`,
		defaultValue: "Untitled folder",
		submitBtn: "Create",
	})
}

async function createChildFolderPost(req, res, next) {
	const { id } = req.params
	const ownerId = req.user.id

	if (!id) {
		throw new CustomNotFoundError("Folder not found!")
	}

	try {
		const { name } = req.body
		await prisma.folder.update({
			where: { id },
			data: {
				children: {
					create: {
						name,
						owner: {
							connect: {
								id: ownerId,
							},
						},
					},
				},
			},
		})
		res.redirect(`/folders/${id}`)
	} catch (err) {
		next(err)
	}
}

const createFolderFilePost = [
	upload.single("file"),
	// TODO: Validate file,
	async (req, res, next) => {
		const { id } = req.params
		const ownerId = req.user.id

		if (!id) {
			throw new CustomNotFoundError("Folder not found!")
		}

		const { originalname: name, size, mimetype: mimeType, path } = req.file

		try {
			await prisma.folder.update({
				where: { id },
				data: {
					files: {
						create: {
							name,
							size,
							mimeType,
							path,
							owner: { connect: { id: ownerId } },
						},
					},
				},
			})
			res.redirect(`/folders/${id}`)
		} catch (err) {
			next(err)
		}
	},
]

export {
	createFolderGet,
	createFolderPost,
	deleteFolder,
	renameFolderGet,
	renameFolderPost,
	getFolderById,
	createChildFolderGet,
	createChildFolderPost,
	createFolderFilePost,
}
