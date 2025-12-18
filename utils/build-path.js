import { randomUUID } from "node:crypto"
import { extname } from "node:path"

function buildPath(userId, folderId, name) {
	const ext = extname(name) || ""
	const path = `${userId}/${folderId ? folderId : "root"}/${randomUUID()}${ext}`
	return path
}

export default buildPath
