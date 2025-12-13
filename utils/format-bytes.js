function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 B"
	const k = 1024
	const dm = Math.max(0, decimals)
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	const value = bytes / k ** i
	return `${parseFloat(value.toFixed(dm))} ${sizes[i]}`
}

export default formatBytes
