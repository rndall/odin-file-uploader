import UnauthorizedError from "../errors/UnauthorizedError.js"

function requireAuth(req, _res, next) {
	if (req.isAuthenticated()) return next()
	throw new UnauthorizedError("User not authenticated!")
}

export { requireAuth }
