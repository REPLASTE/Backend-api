const createConnection = require('../config/database');

class PredictionModel {
  static async getByUserId(userId) {
    let connection;
    try {
      connection = await createConnection();
      const [predictions] = await connection.execute(
        'SELECT image_url, jenis_plastik, confidence_score, created_at FROM hasil_prediksi WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return predictions;
    } catch (error) {
      console.error('Error getting predictions:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = PredictionModel;