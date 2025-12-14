import { Router } from "express"
import {
	createChildFolderGet,
	createChildFolderPost,
	createFolderFilePost,
	createFolderGet,
	createFolderPost,
	deleteFolder,
	getFolderById,
	renameFolderGet,
	renameFolderPost,
} from "../controllers/folders.js"
import { requireAuth } from "../middlewares/auth.js"

const router = Router()

router.use(requireAuth)

router.post("/", createFolderPost)
router.get("/new", createFolderGet)

router.get("/:id", getFolderById)

router.post("/:id/children", createChildFolderPost)
router.post("/:id/files", createFolderFilePost)

router.get("/:id/children", createChildFolderGet)

router.get("/:id/rename", renameFolderGet)
router.post("/:id/rename", renameFolderPost)

router.post("/:id/delete", deleteFolder)

export default router
