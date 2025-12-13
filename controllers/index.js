import multer from "multer"
import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"
import { formatDateModified } from "../utils/date-formatter.js"
import formatBytes from "../utils/format-bytes.js"

const upload = multer({ dest: "./public/data/uploads/" })

async function getIndex(req, res, next) {
	let files = []

	if (req.isAuthenticated()) {
		const ownerId = req.user.id

		try {
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

	res.render("index", { files })
}

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

export { getIndex, createFilePost }
