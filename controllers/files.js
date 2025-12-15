import { unlink } from "node:fs/promises"
import multer from "multer"

import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"
import { formatDate } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"
import { redirectToFolder } from "../utils/paths.js"

const upload = multer({ dest: "./public/data/uploads/" })

const createFilePost = [
	upload.single("file"),
	// TODO: Validate file,
	async (req, res, next) => {
		const { originalname: name, size, mimetype: mimeType, path } = req.file
		const id = req.user.id

		try {
			await prisma.file.create({
				data: { name, size, mimeType, path, owner: { connect: { id } } },
			})

			res.redirect("/")
		} catch (err) {
			next(err)
		}
	},
]

async function getFileById(req, res, next) {
	const { id: fileId } = req.params

	try {
		const file = await prisma.file.findUnique({
			where: { id: fileId },
			select: {
				id: true,
				name: true,
				size: true,
				mimeType: true,
				owner: true,
				folder: {
					select: {
						id: true,
						name: true,
					},
				},
				modifiedAt: true,
				createdAt: true,
			},
		})

		if (!file) {
			throw new CustomNotFoundError("File not found!")
		}

		const { id, name, size, mimeType, owner, folder, modifiedAt, createdAt } =
			file

		const formattedFile = {
			id,
			name,
			size: formatBytes(size),
			mimeType,
			owner,
			folder,
			createdAt: formatDate(createdAt),
			modifiedAt: formatDate(modifiedAt),
		}

		res.render("files/file", { file: formattedFile, type: "files" })
	} catch (err) {
		next(err)
	}
}

async function deleteFile(req, res, next) {
	const { id } = req.params

	try {
		const deletedFile = await prisma.file.delete({
			where: { id },
			select: { path: true, folderId: true },
		})

		if (!deletedFile) {
			throw new CustomNotFoundError("File not found!")
		}

		await unlink(deletedFile.path)
		redirectToFolder(res, deletedFile.folderId)
	} catch (err) {
		next(err)
	}
}

async function renameFileGet(req, res, next) {
	const { id } = req.params

	try {
		const file = await prisma.file.findUnique({
			where: { id },
			select: { name: true },
		})

		if (!file) {
			throw new CustomNotFoundError("File not found!")
		}

		res.render("form", {
			title: "Rename File",
			heading: "Rename",
			defaultValue: file.name,
			submitBtn: "OK",
		})
	} catch (err) {
		next(err)
	}
}

async function renameFilePost(req, res, next) {
	const { id } = req.params
	const { name } = req.body

	try {
		const updatedFile = await prisma.file.update({
			where: { id },
			data: { name },
			select: { folderId: true },
		})

		if (!updatedFile) {
			throw new CustomNotFoundError("File not found!")
		}

		redirectToFolder(res, updatedFile.folderId)
	} catch (err) {
		next(err)
	}
}

export {
	createFilePost,
	getFileById,
	deleteFile,
	renameFileGet,
	renameFilePost,
}
