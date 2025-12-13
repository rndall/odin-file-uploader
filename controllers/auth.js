import { hash } from "bcrypt"
import passport from "passport"
import { prisma } from "../lib/prisma.js"

async function signUpGet(_req, res) {
	res.render("sign-up-form")
}

async function signUpPost(req, res, next) {
	const { username, password } = req.body

	try {
		const passwordHash = await hash(password, 10)
		await prisma.user.create({
			data: {
				username,
				passwordHash,
			},
		})
		res.redirect("/")
	} catch (error) {
		// console.error(error)
		next(error)
	}
}

async function loginGet(_req, res) {
	res.render("index")
}

async function loginPost(req, res, next) {
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/",
	})(req, res, next)
}

async function logout(req, res, next) {
	req.logout((err) => {
		if (err) {
			return next(err)
		}
		res.redirect("/")
	})
}

export { signUpGet, signUpPost, loginGet, loginPost, logout }
