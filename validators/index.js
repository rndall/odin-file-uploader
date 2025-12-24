import { body } from "express-validator"

export const validateLayout = [
	body("layout")
		.custom((value) => ["list", "grid"].includes(value))
		.withMessage("Invalid layout type."),
]
