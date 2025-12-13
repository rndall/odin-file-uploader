import { Router } from "express"
import {
	createFilePost,
	deleteFile,
	getIndex,
	renameFileGet,
	renameFilePost,
} from "../controllers/index.js"
import { requireAuth } from "../middlewares/auth.js"

const router = Router()

router.get("/", getIndex)

router.use(requireAuth)

router.post("/upload", createFilePost)
router.post("/:id/delete", deleteFile)
router.get("/:id/rename", renameFileGet)
router.post("/:id/rename", renameFilePost)

export default router
