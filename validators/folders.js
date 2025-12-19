import { body } from "express-validator"

export const validateFolderName = [
	body("name").notEmpty().withMessage("Folder name is required."),
]
