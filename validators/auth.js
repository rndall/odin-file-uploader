import { body } from "express-validator"

export const validateSignUp = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Username is required.")
		.isLength({ min: 3 })
		.withMessage("Username must be at least 3 characters."),
	body("password")
		.notEmpty()
		.withMessage("Password is required.")
		.isLength({ min: 6 })
		.withMessage("Password must at least be 6 characters."),
	body("passwordConfirmation")
		.notEmpty()
		.withMessage("Password confirmation is required.")
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords do not match."),
]

export const validateLogin = [
	body("username").trim().notEmpty().withMessage("Username is required."),
	body("password").notEmpty().withMessage("Password is required."),
]
