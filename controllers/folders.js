import multer from "multer"

import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"

import buildBreadcrumbs from "../utils/build-breadcrumbs.js"
import { formatDate, formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"
import { redirectToFolder } from "../utils/paths.js"

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

	try {
		const deletedFolder = await prisma.folder.delete({
			where: { id },
			select: { parentId },
		})

		if (!deletedFolder) {
			throw new CustomNotFoundError("Folder not found!")
		}

		redirectToFolder(res, deletedFolder.parentId)
	} catch (err) {
		next(err)
	}
}

async function renameFolderGet(req, res, next) {
	const { id } = req.params

	try {
		const folder = await prisma.folder.findUnique({
			where: { id },
			select: { name: true },
		})

		if (!folder) {
			throw new CustomNotFoundError("Folder not found!")
		}

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

	try {
		const updatedFolder = await prisma.folder.update({
			where: { id },
			data: { name },
			select: { parentId: true },
		})

		if (!updatedFolder) {
			throw new CustomNotFoundError("Folder not found!")
		}

		redirectToFolder(res, updatedFolder.parentId)
	} catch (err) {
		next(err)
	}
}

async function getFolderById(req, res, next) {
	const { id } = req.params

	const baseLink = `${req.originalUrl}/children`
	const fileUploadFormAction = `/folders/${id}/files`

	try {
		const folder = await prisma.folder.findUnique({
			where: { id },
			select: {
				id: true,
				children: true,
				files: true,
			},
		})

		if (!folder) {
			throw new CustomNotFoundError("Folder not found!")
		}

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

		const breadcrumbs = await buildBreadcrumbs(folder.id)

		res.render("index", {
			folders,
			files,
			baseLink,
			fileUploadFormAction,
			breadcrumbs,
		})
	} catch (err) {
		next(err)
	}
}

async function getFolderDetailsById(req, res, next) {
	const { id: folderId } = req.params

	try {
		const folder = await prisma.folder.findUnique({
			where: { id: folderId },
			select: {
				id: true,
				name: true,
				modifiedAt: true,
				createdAt: true,
				parent: { select: { id: true, name: true } },
			},
		})

		if (!folder) {
			throw new CustomNotFoundError("Folder not found!")
		}

		const { id, name, parent, modifiedAt, createdAt } = folder

		const formattedFolder = {
			id,
			name,
			folder: parent,
			modifiedAt: formatDate(modifiedAt),
			createdAt: formatDate(createdAt),
		}

		res.render("files/file", { file: formattedFolder, type: "folders" })
	} catch (err) {
		next(err)
	}
}

async function createChildFolderGet(req, res) {
	const { id } = req.params

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

	const { name } = req.body

	try {
		const folder = await prisma.folder.update({
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

		if (!folder) {
			throw new CustomNotFoundError("Folder not found!")
		}

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

		const { originalname: name, size, mimetype: mimeType, path } = req.file

		try {
			const folder = await prisma.folder.update({
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

			if (!folder) {
				throw new CustomNotFoundError("Folder not found!")
			}

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
	getFolderDetailsById,
	createChildFolderGet,
	createChildFolderPost,
	createFolderFilePost,
}
