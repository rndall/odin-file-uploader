export default (err, _req, res, _next) => {
	console.error(err)
	res.status(err.statusCode || 500).send(err.message)
}
