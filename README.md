## My Files — README

Minimal Express + Prisma file storage with session auth.

Setup
1. git clone <repo> && cd odin-file-uploader
2. pnpm install
3. Setup .env
4. pnpm prisma migrate dev && pnpm prisma:generate
5. pnpm dev

Features
- Passport session auth (prisma-session-store)
- Folder CRUD
- File upload (multer), metadata, download
- File type/size validation

Todo (extra credit)
- [ ] Share folder: expiring public link (/share/`<uuid>`)
