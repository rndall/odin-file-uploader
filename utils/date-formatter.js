function formatDateModified(modifiedAt) {
	const date = new Date(modifiedAt)
	const now = new Date()

	let options = {}
	const showTime = date.toDateString() === now.toDateString()

	if (showTime) {
		options = {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}
	} else {
		const showYear = date.getFullYear() !== now.getFullYear()
		options = { month: "short", day: "numeric" }
		if (showYear) options.year = "numeric"
	}

	const formatter = new Intl.DateTimeFormat("en-US", options)
	return formatter.format(modifiedAt)
}

export { formatDateModified }
