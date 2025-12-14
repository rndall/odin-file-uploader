export function folderPath(folderId) {
	return folderId ? `/folders/${folderId}` : "/"
}

export function redirectToFolder(res, folderId) {
	return res.redirect(folderPath(folderId))
}
