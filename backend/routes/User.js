const express = require('express')
const { fetchLoggedInUserById, updateUserById } = require('../controllers/User')
const router = express.Router()

router.get('/:id', fetchLoggedInUserById)
router.patch('/:id', updateUserById)

module.exports = router