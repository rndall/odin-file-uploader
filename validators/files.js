import { body } from "express-validator"

export const validateFileName = [
	body("name").notEmpty().withMessage("File name is required."),
]
