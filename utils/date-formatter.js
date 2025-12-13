function formatDateModified(modifiedAt) {
	const date = new Date(modifiedAt)
	const now = new Date()
	const showYear = date.getFullYear() !== now.getFullYear()
	const options = { month: "short", day: "numeric" }
	if (showYear) options.year = "numeric"

	const formatter = new Intl.DateTimeFormat("en-US", options)
	return formatter.format(modifiedAt)
}

export { formatDateModified }
