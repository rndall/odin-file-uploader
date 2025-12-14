import { unlink } from "node:fs/promises"
import multer from "multer"
import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"

const upload = multer({ dest: "./public/data/uploads/" })

const createFilePost = [
	upload.single("file"),
	async (req, res, next) => {
		if (!req.file) throw new CustomNotFoundError("File not found!")

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

async function deleteFile(req, res, next) {
	const { id } = req.params

	if (!id) {
		throw new CustomNotFoundError("File not found!")
	}

	try {
		const file = await prisma.file.delete({ where: { id } })
		await unlink(file.path)
		res.redirect("/")
	} catch (err) {
		next(err)
	}
}

async function renameFileGet(req, res, next) {
	const { id } = req.params

	if (!id) {
		throw new CustomNotFoundError("File not found!")
	}

	try {
		const file = await prisma.file.findUnique({ where: { id } })
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

	if (!id) {
		throw new CustomNotFoundError("File not found!")
	}

	try {
		await prisma.file.update({
			where: { id },
			data: { name },
		})
		res.redirect("/")
	} catch (err) {
		next(err)
	}
}

export { createFilePost, deleteFile, renameFileGet, renameFilePost }
