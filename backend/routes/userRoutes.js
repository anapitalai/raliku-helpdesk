const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  getEmailVerification,
  getEmailVerified,
} = require('../controllers/userController')

const { protect } = require('../middleware/authMiddleware')

router.post('/', registerUser)
router.get('/verify/:userId/:uniqueString',getEmailVerification)
router.get('/verified',getEmailVerified)
router.post('/login', loginUser)
router.get('/me', protect, getMe)


module.exports = router
