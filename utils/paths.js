import { randomUUID } from "node:crypto"
import { extname } from "node:path"

import { prisma } from "../lib/prisma.js"

function folderPath(folderId) {
	return folderId ? `/folders/${folderId}` : "/"
}

export function redirectToFolder(res, folderId) {
	return res.redirect(folderPath(folderId))
}

export function buildFilePath(userId, name, folderPath) {
	const ext = extname(name) || ""
	const fileName = `${randomUUID()}${ext}`
	const path = folderPath
		? `${userId}/${folderPath}/${fileName}`
		: `${userId}/${fileName}`
	return path
}

export async function getFullFolderPath(folderId) {
	const parts = []

	let current = await prisma.folder.findUnique({
		where: { id: folderId },
		select: { id: true, parentId: true },
	})

	while (current) {
		parts.unshift(current.id)

		if (!current.parentId) break

		current = await prisma.folder.findUnique({
			where: { id: current.parentId },
			select: { id: true, parentId: true },
		})
	}

	return parts.join("/")
}
