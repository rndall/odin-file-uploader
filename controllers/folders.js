import CustomNotFoundError from "../errors/CustomNotFoundError.js"
import { prisma } from "../lib/prisma.js"

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

export {
	createFolderGet,
	createFolderPost,
	deleteFolder,
	renameFolderGet,
	renameFolderPost,
}
