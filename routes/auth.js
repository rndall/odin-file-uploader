import { Router } from "express"
import {
	loginGet,
	loginPost,
	logout,
	signUpGet,
	signUpPost,
} from "../controllers/auth.js"

const router = Router()

router.get("/", loginGet)
router.post("/log-in", loginPost)
router.get("/sign-up", signUpGet)
router.post("/sign-up", signUpPost)
router.get("/log-out", logout)

export default router
