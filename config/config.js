const required = (name) => {
	const v = process.env[name]
	if (!v) throw new Error(`Missing required env var: ${name}`)
	return v
}

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
export const DATABASE_URL = required("DATABASE_URL")
export const SECRET = required("SECRET")
export const SUPABASE_URL = required("SUPABASE_URL")
export const SUPABASE_KEY = required("SUPABASE_KEY")
export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "user-files"
