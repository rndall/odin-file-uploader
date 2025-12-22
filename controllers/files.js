import { matchedData } from "express-validator"

import { SUPABASE_BUCKET } from "../config/config.js"
import CustomNotFoundError from "../errors/CustomNotFoundError.js"

import { upload } from "../lib/multer.js"
import { prisma } from "../lib/prisma.js"
import supabase from "../lib/supabaseServer.js"

import { setFileDetailsIcons } from "../middlewares/icons.js"
import validateResult from "../middlewares/validate-result.js"

import { formatDate } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"
import { getFileTypeIcon } from "../utils/icons.js"
import { buildFilePath, redirectToFolder } from "../utils/paths.js"

import { validateFileName } from "../validators/files.js"

const createFilePost = [
	upload.single("file"),
	async (req, res, next) => {
		if (!req.file) {
			throw new CustomNotFoundError("File not found!")
		}

		const { originalname: name, size, mimetype: mimeType, buffer } = req.file
		const id = req.user.id

		const path = buildFilePath(id, name)

		const { error } = await supabase.storage
			.from(SUPABASE_BUCKET)
			.upload(path, buffer, { contentType: mimeType })

		if (error) throw error

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

const getFileById = [
	setFileDetailsIcons,
	async (req, res, next) => {
		const { id: fileId } = req.params

		try {
			const file = await prisma.file.findUnique({
				where: { id: fileId, ownerId: req.user.id },
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
				icon: getFileTypeIcon(file),
			}

			const backHref = folder?.id ? `/folders/${folder.id}` : "/"

			res.render("files/file", {
				file: formattedFile,
				type: "files",
				backHref,
			})
		} catch (err) {
			next(err)
		}
	},
]

async function downloadFile(req, res, next) {
	const { id } = req.params

	try {
		const file = await prisma.file.findUnique({
			where: { id, ownerId: req.user.id },
			select: { name: true, path: true, mimeType: true },
		})

		if (!file) {
			throw new CustomNotFoundError("File not found!")
		}

		const { data, error } = await supabase.storage
			.from(SUPABASE_BUCKET)
			.download(file.path)

		if (error) throw error

		const buffer = Buffer.from(await data.arrayBuffer())

		res.set("Content-Type", file.mimeType)
		res.set(
			"Content-Disposition",
			`attachment; filename="${encodeURIComponent(file.name)}"`,
		)
		res.set("Content-Length", buffer.length)
		res.send(buffer)
	} catch (err) {
		next(err)
	}
}

async function deleteFile(req, res, next) {
	const { id } = req.params
	const ownerId = req.user.id

	try {
		const file = await prisma.file.findUnique({
			where: { id, ownerId },
			select: { path: true, folderId: true, ownerId: true },
		})

		if (!file) {
			throw new CustomNotFoundError("File not found!")
		}

		const { error } = await supabase.storage
			.from(SUPABASE_BUCKET)
			.remove([file.path])

		if (error) throw error

		await prisma.file.delete({ where: { id, ownerId } })

		redirectToFolder(res, file.folderId)
	} catch (err) {
		next(err)
	}
}

async function renameFileGet(req, res, next) {
	const { id } = req.params

	try {
		const file = await prisma.file.findUnique({
			where: { id, ownerId: req.user.id },
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

const renameFilePost = [
	validateFileName,
	validateResult,
	async (req, res, next) => {
		const { errors } = req
		const { id } = req.params
		const ownerId = req.user.id

		if (errors) {
			const file = await prisma.file.findUnique({
				where: { id, ownerId },
				select: { name: true },
			})
			return res.render("form", {
				title: "Rename File",
				heading: "Rename",
				defaultValue: file.name,
				submitBtn: "OK",
				errors,
			})
		}

		const { name } = matchedData(req)

		try {
			const updatedFile = await prisma.file.update({
				where: { id, ownerId },
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
	},
]

export {
	createFilePost,
	getFileById,
	downloadFile,
	deleteFile,
	renameFileGet,
	renameFilePost,
}
