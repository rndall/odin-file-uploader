import { PrismaSessionStore } from "@quixo3/prisma-session-store"
import expressSession from "express-session"

import { SECRET } from "../config/config.js"
import { prisma } from "../lib/prisma.js"

export default expressSession({
	cookie: {
		maxAge: 7 * 24 * 60 * 60 * 1000, // ms
	},
	secret: SECRET,
	resave: true,
	saveUninitialized: true,
	store: new PrismaSessionStore(prisma, {
		checkPeriod: 2 * 60 * 1000, //ms
		dbRecordIdIsSessionId: true,
		dbRecordIdFunction: undefined,
	}),
})
