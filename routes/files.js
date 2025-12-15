import Router from "express"
import {
	createFilePost,
	deleteFile,
	downloadFile,
	getFileById,
	renameFileGet,
	renameFilePost,
} from "../controllers/files.js"
import { requireAuth } from "../middlewares/auth.js"

const router = Router()

router.use(requireAuth)

router.post("/", createFilePost)
router.get("/:id", getFileById)
router.get("/:id/download", downloadFile)
router.post("/:id/delete", deleteFile)
router.get("/:id/rename", renameFileGet)
router.post("/:id/rename", renameFilePost)

export default router
