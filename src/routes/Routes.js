const express = require('express');
const router = express.Router();
const { AuthController, HasilPrediksiController, JenisPlastikController, RecyclingLocationController } = require('../controllers/handler');

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/request-reset', AuthController.requestReset);
router.get('/validate-token/:token', AuthController.validateResetToken);
router.post('/reset/:token', AuthController.resetPassword);
router.get('/getUserProfile/:userId', AuthController.getUserProfile);
router.put('/updatePassword/:userId', AuthController.updatePassword);
router.put('/updateProfile/:userId', AuthController.updateProfile);

// routes memanggil history prediksi
router.get('/predictions/:userId', HasilPrediksiController.getUserPredictions);

// routes jenis plastik untuk diakses mobile app  
router.get('/getAllPlastik', JenisPlastikController.getAllJenisPlastik);
router.get('/getPlastik/:id', JenisPlastikController.getJenisPlastikById);
router.get('/getPlastikImage/:id', JenisPlastikController.getImageById);

// routes jenis plastik untuk admin
router.post('/createJenisPlastik',
  JenisPlastikController.uploadMiddleware,
  JenisPlastikController.createJenisPlastik
);
router.put('/updateJenisPlastik/:id',
  JenisPlastikController.uploadMiddleware,
  JenisPlastikController.updateJenisPlastik
);
router.delete('/deleteJenisPlastik/:id', JenisPlastikController.deleteJenisPlastik);

// routes lokasi untuk mobile app
router.get('/getAllLokasi', RecyclingLocationController.getAll);
router.get('/getLokasi/:id', RecyclingLocationController.getById);
router.get('/getImageLokasi/:id', RecyclingLocationController.getImageById);

// routes lokasi untuk admin
router.post('/createLokasi', 
  RecyclingLocationController.uploadMiddleware,
  RecyclingLocationController.create
);
router.put('/updateLokasi/:id',
  RecyclingLocationController.uploadMiddleware,
  RecyclingLocationController.update
);
router.delete('/deleteLokasi/:id', RecyclingLocationController.delete);

module.exports = router;