import multer from "multer"

const upload = multer({ dest: "./public/data/uploads/" })

const createFilePost = [
	upload.single("file"),
	(req, _res) => {
		console.log(req.file)
	},
]

export { createFilePost }
