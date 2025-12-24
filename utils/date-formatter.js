import {
	format,
	formatDistanceToNowStrict,
	isThisYear,
	isToday,
	isYesterday,
} from "date-fns"

function formatDateModified(date) {
	if (isToday(date)) {
		return format(date, "h:mm a")
	} else {
		return isThisYear(date) ? format(date, "MMM d") : formatDate(date)
	}
}

function formatDate(date) {
	return format(date, "MMM d, yyyy")
}

function formatToNow(date) {
	if (isYesterday(date)) return "yesterday"
	return formatDistanceToNowStrict(date, { addSuffix: true })
}

export { formatDateModified, formatDate, formatToNow }
