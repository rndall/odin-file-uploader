import { Router } from "express"
import { createFilePost } from "../controllers/index.js"
import { requireAuth } from "../middlewares/auth.js"

const router = Router()

router.post("/upload", requireAuth, createFilePost)

export default router
