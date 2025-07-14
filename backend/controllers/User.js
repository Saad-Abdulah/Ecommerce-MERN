const User = require('../models/User')
const multer = require('multer')
const path = require('path')

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../frontend/public/profileImages/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Not an image! Please upload an image.'), false)
        }
    }
}).single('profileImage')

// Update user by id
exports.updateUserById = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err) {
                return res.status(400).json({ message: err.message })
            }

            const update = { ...req.body }
            if (req.file) {
                update.profileImage = req.file.filename
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.body._id,
                update,
                { new: true }
            ).select('-password')

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" })
            }

            res.json(updatedUser)
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Get logged in user by id
exports.fetchLoggedInUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}