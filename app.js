import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import express, { static as static_, urlencoded } from "express"
import passport from "passport"
import configurePassport from "./config/passport.js"
import currentUser from "./middlewares/current-user.js"
import errorHandler from "./middlewares/error-handler.js"
import sessionMiddleware from "./middlewares/session.js"

import authRouter from "./routes/auth.js"
import indexRouter from "./routes/index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.set("views", join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(sessionMiddleware)

configurePassport()
app.use(passport.session())
app.use(urlencoded({ extended: false }))

app.use(currentUser)

app.use("/", indexRouter)
app.use("/", authRouter)

const assetsPath = join(__dirname, "public")
app.use(static_(assetsPath))

app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, (err) => {
	if (err) {
		throw err
	}
	console.log(`Listening on port ${PORT}`)
})
