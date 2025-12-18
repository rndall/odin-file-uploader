import multer, { memoryStorage } from "multer"

export const upload = multer({
	storage: memoryStorage(),
	limits: { fileSize: 50 * 1024 * 1024 }, // 5MB
})
