import { Router } from "express"
import { createFilePost, getIndex } from "../controllers/index.js"
import { requireAuth } from "../middlewares/auth.js"

const router = Router()

router.get("/", getIndex)
router.post("/upload", requireAuth, createFilePost)

export default router
