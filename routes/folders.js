import { Router } from "express"
import {
	createFolderGet,
	createFolderPost,
	deleteFolder,
	renameFolderGet,
	renameFolderPost,
} from "../controllers/folders.js"
import { requireAuth } from "../middlewares/auth.js"

const router = Router()

router.use(requireAuth)

router.post("/", createFolderPost)
router.get("/new", createFolderGet)
router.post("/:id/delete", deleteFolder)
router.get("/:id/rename", renameFolderGet)
router.post("/:id/rename", renameFolderPost)

export default router
