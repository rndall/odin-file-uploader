import { Router } from "express"
import { createFilePost } from "../controllers/index.js"

const router = Router()

router.post("/upload", createFilePost)

export default router
