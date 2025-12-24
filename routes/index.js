import { Router } from "express"
import { getIndex, setLayout } from "../controllers/index.js"

const router = Router()

router.get("/", getIndex)
router.post("/layout", setLayout)

export default router
