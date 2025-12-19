import { matchedData } from "express-validator"
import { SUPABASE_BUCKET } from "../config/config.js"
import CustomNotFoundError from "../errors/CustomNotFoundError.js"

import { upload } from "../lib/multer.js"
import { prisma } from "../lib/prisma.js"
import supabase from "../lib/supabaseServer.js"

import validateResult from "../middlewares/validate-result.js"
import buildBreadcrumbs from "../utils/build-breadcrumbs.js"
import { formatDate, formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"
import {
	buildFilePath,
	getFullFolderPath,
	redirectToFolder,
} from "../utils/paths.js"
import { validateFolderName } from "../validators/folders.js"

async function createFolderGet(_req, res) {
	res.render("form", {
		title: "New Folder",
		heading: "New Folder",
		action: "/folders",
		defaultValue: "Untitled folder",
		submitBtn: "Create",
	})
}

const createFolderPost = [
	validateFolderName,
	validateResult,
	async (req, res, next) => {
		const { errors } = req
		if (errors) {
			return res.render("form", {
				title: "New Folder",
				heading: "New Folder",
				action: "/folders",
				defaultValue: "Untitled folder",
				submitBtn: "Create",
				errors,
			})
		}

		const { name } = matchedData(req)
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
	},
]

async function deleteFolder(req, res, next) {
	const { id } = req.params
	const ownerId = req.user.id

	const folderPath = await getFullFolderPath(id)
	const prefix = `${req.user.id}/${folderPath}`

	try {
		const files = await prisma.file.findMany({
			where: {
				path: { startsWith: prefix },
				ownerId,
			},
			select: { path: true },
		})

		const paths = files.map((f) => f.path)

		if (paths.length) {
			const { error } = await supabase.storage
				.from(SUPABASE_BUCKET)
				.remove(paths)

			if (error) throw error
		}

		await prisma.file.deleteMany({
			where: { path: { startsWith: prefix }, ownerId },
		})

		const deletedFolder = await prisma.folder.delete({
			where: { id, ownerId },
			select: { parentId: true },
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
			where: { id, ownerId: req.user.id },
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

const renameFolderPost = [
	validateFolderName,
	validateResult,
	async (req, res, next) => {
		const { errors } = req
		const { id } = req.params
		const ownerId = req.user.id

		if (errors) {
			const folder = await prisma.folder.findUnique({
				where: { id, ownerId },
				select: { name: true },
			})
			return res.render("form", {
				title: "Rename Folder",
				heading: "Rename",
				defaultValue: folder.name,
				submitBtn: "OK",
				errors,
			})
		}

		const { name } = matchedData(req)

		try {
			const updatedFolder = await prisma.folder.update({
				where: { id, ownerId },
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
	},
]

async function getFolderById(req, res, next) {
	const { id } = req.params

	const baseLink = `${req.originalUrl}/children`
	const fileUploadFormAction = `/folders/${id}/files`

	try {
		const folder = await prisma.folder.findUnique({
			where: { id, ownerId: req.user.id },
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
			where: { id: folderId, ownerId: req.user.id },
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

const createChildFolderPost = [
	validateFolderName,
	validateResult,
	async (req, res, next) => {
		const { errors } = req
		const { id } = req.params

		if (errors) {
			return res.render("form", {
				title: "New Folder",
				heading: "New Folder",
				action: `/folders/${id}/children`,
				defaultValue: "Untitled folder",
				submitBtn: "Create",
			})
		}

		const { name } = matchedData(req)
		const ownerId = req.user.id

		try {
			const folder = await prisma.folder.update({
				where: { id, ownerId },
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
	},
]

const createFolderFilePost = [
	upload.single("file"),
	async (req, res, next) => {
		if (!req.file) {
			throw new CustomNotFoundError("File not found!")
		}

		const { id } = req.params
		const ownerId = req.user.id

		const { originalname: name, size, mimetype: mimeType, buffer } = req.file

		const folderPath = await getFullFolderPath(id)
		const path = buildFilePath(ownerId, name, folderPath)

		const { error } = await supabase.storage
			.from(SUPABASE_BUCKET)
			.upload(path, buffer, { contentType: mimeType })

		if (error) throw error

		try {
			const folder = await prisma.folder.update({
				where: { id, ownerId },
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
