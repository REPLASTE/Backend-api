const UserModel = require('../models/userModel');
const crypto = require('crypto');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../config/jwt');
const { sendEmail } = require('../config/email');
const multer = require('multer');
const { bucket } = require('../config/storage');
const PredictionModel = require('../models/predictionModel');
const JenisPlastikModel = require('../models/jenisPlastikModel');
const RecyclingLocationModel = require('../models/recyclingLocationModel');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      const hashedPassword = await hashPassword(password);

      const userId = await UserModel.create(email, hashedPassword, full_name);

      res.status(201).json({
        message: 'User berhasil didaftarkan',
        userId
      });

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password harus diisi' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        message: 'Login berhasil',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async requestReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email harus diisi' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Email tidak terdaftar' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 jam
      
      console.log('Updating reset token for user:', {
        userId: user.id,
        resetToken,
        resetTokenExpiry
      });

      const updated = await UserModel.updateResetToken(
            user.id,
            resetToken,
            resetTokenExpiry
      );

      if (!updated) {
        return res.status(500).json({ message: 'Gagal mengupdate reset token' });
      }

      const updatedUser = await UserModel.findById(user.id);
      console.log('User after update:', {
        id: updatedUser.id,
        email: updatedUser.email,
        resetToken: updatedUser.reset_token,
        resetTokenExpiry: updatedUser.reset_token_expiry
      });

      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <!-- Anda bisa menambahkan logo perusahaan di sini -->
            <h1 style="color: #333333; margin: 0; font-size: 24px;">Reset Password</h1>
          </div>
        
          <div style="color: #666666; font-size: 16px; line-height: 1.5;">
            <p>Hai,</p>
            <p>Kami menerima permintaan untuk mengatur ulang password akun Anda. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #333333;">Kode Reset Password Anda:</p>
                <p style="font-family: monospace; font-size: 24px; color: #2c5282; margin: 10px 0; word-break: break-all;">${resetToken}</p>
            </div>
            
            <p>Untuk menyelesaikan proses reset password, gunakan kode di atas dengan mengikuti langkah berikut:</p>
            
            <ol style="color: #666666; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Buka aplikasi atau website kami</li>
                <li style="margin-bottom: 10px;">Masukkan kode reset password di atas</li>
                <li style="margin-bottom: 10px;">Buat password baru Anda</li>
            </ol>
            
            <p style="color: #999999; font-size: 14px; margin-top: 30px;">
                * Kode ini hanya berlaku selama 1 jam dan hanya dapat digunakan satu kali.
            </p>
          </div>
        
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999999; font-size: 12px; text-align: center;">
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>Jika Anda membutuhkan bantuan, silakan hubungi tim support kami.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const emailSent = await sendEmail(
        email,
        'Reset Password Request',
        emailHtml
      );

      if (!emailSent) {
        return res.status(500).json({ message: 'Gagal mengirim email reset password' });
      }
      res.json({ message: 'Email reset password berhasil dikirim' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async validateResetToken(req, res) {
    try {
      const { token } = req.params;

      const user = await UserModel.findByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
      }

      res.json({ message: 'Token valid' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: 'Password baru harus diisi' });
      }

      const user = await UserModel.findByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
      }

      const hashedPassword = await hashPassword(password);

      await UserModel.updatePassword(user.id, hashedPassword);

      res.json({ message: 'Password berhasil direset' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      res.json({ full_name: user.full_name, email: user.email });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async updatePassword(req, res) {
    try {
      const { userId } = req.params;
      const { oldPassword, retypePassword, newPassword } = req.body;

      if (!oldPassword || !retypePassword || !newPassword) {
          return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      if (newPassword !== retypePassword) {
        return res.status(400).json({ message: 'Password baru tidak cocok' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      const isPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Password lama salah' });
      }

      const hashedPassword = await hashPassword(newPassword);

      await UserModel.updatePassword(userId, hashedPassword);

      res.json({ message: 'Password berhasil diubah' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const { full_name } = req.body;

      if (!full_name) {
          return res.status(400).json({ message: 'Nama lengkap harus diisi' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      const updated = await UserModel.updateProfile(userId, { full_name });
      if (!updated) {
          return res.status(500).json({ message: 'Gagal mengupdate profile' });
      }

      res.json({ message: 'Profile berhasil diubah' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
}

class HasilPrediksiController {
  static async getUserPredictions(req, res) {
    try {
      const { userId } = req.params;
      const predictions = await PredictionModel.getByUserId(userId);

      const formattedResponse = {
        data: predictions.map(prediction => ({
          imageFile: prediction.image_url,
          predictedClass: prediction.jenis_plastik,
          confidence: parseFloat(prediction.confidence_score),
          date: prediction.created_at
        }))
      };

      res.json(formattedResponse);
    } catch (error) {
      console.error('Error getting predictions:', error);
      res.status(500).json({ message: 'Error retrieving predictions' });
    }
  }
}

module.exports = HasilPrediksiController;

class JenisPlastikController {
  static uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }).single('image');
  
  static async getAllJenisPlastik(req, res) {
    try {
      const jenisPlastik = await JenisPlastikModel.getAll();
      res.json(jenisPlastik);
    } catch (error) {
      console.error('Error in getAllJenisPlastik:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async getJenisPlastikById(req, res) {
    try {
      const { id } = req.params;
      const jenisPlastik = await JenisPlastikModel.getById(id);
      
      if (!jenisPlastik) {
        return res.status(404).json({ message: 'Jenis plastik tidak ditemukan' });
      }
      
      res.json(jenisPlastik);
    } catch (error) {
      console.error('Error in getJenisPlastikById:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async getImageById(req, res) {
    try {
      const { id } = req.params;
      const jenisPlastik = await JenisPlastikModel.getImageById(id);
      
      if (!jenisPlastik) {
        return res.status(404).json({ message: 'image plastik tidak ditemukan' });
      }
      
      res.json(jenisPlastik);
    } catch (error) {
      console.error('Error in getImageById:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async createJenisPlastik(req, res) {
    try {
      const { nama, kode, deskripsi, recycling_time, produk_penggunaan, environmental_impact } = req.body;
      
      // Validasi input
      if (!nama || !kode || !deskripsi || !recycling_time || !produk_penggunaan || !environmental_impact) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      let imageUrl = null;
      let fileName = null;

      if (req.file) {
        const file = req.file;
        const fileExtension = file.originalname.split('.').pop();
        // Add folder prefix to fileName
        fileName = `jenis-plastik/plastik_${Date.now()}.${fileExtension}`;
      
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: {
          contentType: file.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', reject);
          blobStream.on('finish', resolve);
          blobStream.end(file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }

      const newId = await JenisPlastikModel.create({
        nama,
        kode,
        deskripsi,
        recycling_time,
        produk_penggunaan,
        environmental_impact,
        imageUrl,
        fileName
      });

      res.status(201).json({
        message: 'Jenis plastik berhasil ditambahkan',
        id: newId,
        imageUrl
      });
    } catch (error) {
      console.error('Error in createJenisPlastik:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async updateJenisPlastik(req, res) {
    try {
      const { id } = req.params;
      const { nama, kode, deskripsi, recycling_time, produk_penggunaan, environmental_impact } = req.body;

      if (!nama || !kode || !deskripsi || !recycling_time || !produk_penggunaan || !environmental_impact) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      const existingPlastik = await JenisPlastikModel.getById(id);
      if (!existingPlastik) {
        return res.status(404).json({ message: 'Jenis plastik tidak ditemukan' });
      }

      let imageUrl = existingPlastik.image_url;
      let fileName = existingPlastik.file_name;

      if (req.file) {
        if (existingPlastik.file_name) {
          try {
            await bucket.file(existingPlastik.file_name).delete();
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }

        const file = req.file;
        const fileExtension = file.originalname.split('.').pop();
        fileName = `plastik_${Date.now()}.${fileExtension}`;

        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', reject);
          blobStream.on('finish', resolve);
          blobStream.end(file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }

      const updated = await JenisPlastikModel.update(id, {
        nama,
        kode,
        deskripsi,
        recycling_time,
        produk_penggunaan,
        environmental_impact,
        imageUrl,
        fileName
      });

      if (!updated) {
        return res.status(404).json({ message: 'Jenis plastik tidak ditemukan' });
      }

      res.json({ 
        message: 'Jenis plastik berhasil diupdate',
        imageUrl 
      });
    } catch (error) {
      console.error('Error in updateJenisPlastik:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async deleteJenisPlastik(req, res) {
    try {
      const { id } = req.params;
      const result = await JenisPlastikModel.delete(id);

      if (!result.deleted) {
        return res.status(404).json({ message: 'Jenis plastik tidak ditemukan' });
      }

      if (result.fileName) {
        try {
          await bucket.file(result.fileName).delete();
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      res.json({ message: 'Jenis plastik berhasil dihapus' });
    } catch (error) {
      console.error('Error in deleteJenisPlastik:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
}

class RecyclingLocationController {
  static uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }).single('image');

  static async create(req, res) {
    try {
      const { name, address, phoneNumber, gmapsLink } = req.body;

      if (!name || !address || !phoneNumber || !gmapsLink) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      let imageUrl = null;
      let fileName = null;

      if (req.file) {
        const file = req.file;
        const fileExtension = file.originalname.split('.').pop();
        fileName = `recycling-location-images/location_${Date.now()}.${fileExtension}`;
      
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', reject);
          blobStream.on('finish', resolve);
          blobStream.end(file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }

      const locationId = await RecyclingLocationModel.create(
        name,
        address,
        phoneNumber,
        gmapsLink,
        imageUrl,
        fileName
      );

      res.status(201).json({
        message: 'Lokasi daur ulang berhasil ditambahkan',
        locationId,
        imageUrl
      });

    } catch (error) {
      console.error('Error in creating recycling location:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async getAll(req, res) {
    try {
      const locations = await RecyclingLocationModel.getAll();
      res.json(locations);
    } catch (error) {
      console.error('Error getting recycling locations:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const location = await RecyclingLocationModel.getById(id);
      
      if (!location) {
        return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error getting recycling location:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async getImageById(req, res) {
    try {
      const { id } = req.params;
      const location = await RecyclingLocationModel.getImageById(id);
      
      if (!location) {
        return res.status(404).json({ message: 'Image tidak ditemukan' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error getting recycling image:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, address, phoneNumber, gmapsLink } = req.body;

      if (!name || !address || !phoneNumber || !gmapsLink) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      const existingLocation = await RecyclingLocationModel.getById(id);
      if (!existingLocation) {
        return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
      }

      let imageUrl = existingLocation.image_url;
      let fileName = existingLocation.file_name;

      if (req.file) {
        if (existingLocation.file_name) {
          try {
            await bucket.file(existingLocation.file_name).delete();
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }

        const file = req.file;
        const fileExtension = file.originalname.split('.').pop();
        fileName = `location_${Date.now()}.${fileExtension}`;

        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', reject);
          blobStream.on('finish', resolve);
          blobStream.end(file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }

      const updated = await RecyclingLocationModel.update(
        id,
        name,
        address,
        phoneNumber,
        gmapsLink,
        imageUrl,
        fileName
      );

      if (!updated) {
        return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
      }

      res.json({
        message: 'Lokasi daur ulang berhasil diupdate',
        imageUrl
      });

    } catch (error) {
      console.error('Error updating recycling location:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const location = await RecyclingLocationModel.getById(id);
      if (!location) {
        return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
      }

      if (location.file_name) {
        try {
          await bucket.file(location.file_name).delete();
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      const deleted = await RecyclingLocationModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
      }

      res.json({ message: 'Lokasi daur ulang berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting recycling location:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
}

module.exports = {AuthController, HasilPrediksiController, JenisPlastikController, RecyclingLocationController};