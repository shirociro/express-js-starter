import multer from 'multer'
import fs from 'fs'
import path from 'path'

//  Resolve absolute directory path for uploads (safe & cross-platform)
const profileDir = path.join(process.cwd(), 'uploads', 'profile')

//  Ensure the directory exists (recursive handles nested folders)
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true })
  console.log(` Created upload directory: ${profileDir}`)
}

//  Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const firstname = req.body.firstname.replace(/\s+/g, '_')
    const lastname = req.body.lastname.replace(/\s+/g, '_')
    // Use consistent filename if ID exists (overwrite)
    // const name = `${firstname}_${lastname}_${Date.now()}`
    // const name = `${firstname}_${lastname}_${Date.now()}`
    const name = `${file.originalname}`


    const filePath = path.join(profileDir, name + ext)
    // Overwrite existing file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    console.log(' Multer filename:', name + ext)
    cb(null, name + ext)
  },
})
const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    // Use consistent filename if ID exists (overwrite)
    const name = `${file.originalname}_${Date.now()}`
    const filePath = path.join(profileDir, name + ext)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    console.log(' Multer filename:', name + ext)
    cb(null, name + ext)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error(' Invalid file type. Only JPG and PNG are allowed.'))
}

export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export const uploadLogo = multer({
  storageLogo,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
