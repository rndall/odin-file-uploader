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

export { createFilePost }
