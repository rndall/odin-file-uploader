import { hash } from "bcrypt"
import { matchedData } from "express-validator"
import passport from "passport"

import { prisma } from "../lib/prisma.js"

import validateResult from "../middlewares/validate-result.js"
import { validateLogin, validateSignUp } from "../validators/auth.js"

async function signUpGet(_req, res) {
	res.render("sign-up-form")
}

const signUpPost = [
	validateSignUp,
	validateResult,
	async (req, res, next) => {
		if (req.errors) {
			return res.render("sign-up-form", { errors: req.errors, user: req.body })
		}

		const { username, password } = matchedData(req)

		try {
			const passwordHash = await hash(password, 10)
			const user = await prisma.user.create({
				data: {
					username,
					passwordHash,
				},
			})
			req.login(user, (err) => {
				if (err) {
					return next(err)
				}
				res.redirect("/")
			})
		} catch (error) {
			next(error)
		}
	},
]

async function loginGet(_req, res) {
	res.render("login-form")
}

const loginPost = [
	validateLogin,
	validateResult,
	(req, res, next) => {
		if (req.errors) {
			return res.render("login-form", { errors: req.errors, user: req.body })
		}
		next()
	},
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/log-in",
	}),
]

async function logout(req, res, next) {
	req.logout((err) => {
		if (err) {
			return next(err)
		}
		res.redirect("/")
	})
}

export { signUpGet, signUpPost, loginGet, loginPost, logout }
