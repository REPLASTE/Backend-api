const createConnection = require('../config/database');

class JenisPlastikModel {
  static async getAll() {
    let connection;
    try {
      connection = await createConnection();
      const [jenisPlastik] = await connection.execute(
        'SELECT nama, kode, deskripsi, recycling_time, produk_penggunaan, environmental_impact, image_url FROM jenis_plastik ORDER BY id ASC'
      );
      return jenisPlastik;
    } catch (error) {
      console.error('Error getting jenis plastik:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async getById(id) {
    let connection;
    try {
      connection = await createConnection();
      const [jenisPlastik] = await connection.execute(
        'SELECT nama, kode, deskripsi, recycling_time, produk_penggunaan, environmental_impact, image_url FROM jenis_plastik WHERE id = ?',
        [id]
      );
      return jenisPlastik[0];
    } catch (error) {
      console.error('Error getting jenis plastik by id:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async create(data) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'INSERT INTO jenis_plastik (nama, kode, deskripsi, recycling_time, produk_penggunaan, environmental_impact, image_url, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          data.nama,
          data.kode,
          data.deskripsi,
          data.recycling_time,
          data.produk_penggunaan,
          data.environmental_impact,
          data.imageUrl || null,
          data.fileName || null
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating jenis plastik:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async update(id, data) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'UPDATE jenis_plastik SET nama = ?, kode = ?, deskripsi = ?, recycling_time = ?, produk_penggunaan = ?, environmental_impact = ?, image_url = ?, file_name = ? WHERE id = ?',
        [
          data.nama,
          data.kode,
          data.deskripsi,
          data.recycling_time,
          data.produk_penggunaan,
          data.environmental_impact,
          data.imageUrl || null,
          data.fileName || null,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating jenis plastik:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async delete(id) {
    let connection;
    try {
      connection = await createConnection();
      // Get file name before deleting
      const [jenisPlastik] = await connection.execute(
        'SELECT file_name FROM jenis_plastik WHERE id = ?',
        [id]
      );
      
      const [result] = await connection.execute(
        'DELETE FROM jenis_plastik WHERE id = ?',
        [id]
      );
      
      // Return both the deletion result and file name
      return {
        deleted: result.affectedRows > 0,
        fileName: jenisPlastik[0]?.file_name
      };
    } catch (error) {
      console.error('Error deleting jenis plastik:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async getImageById(id) {
    let connection;
    try {
      connection = await createConnection();
      const [jenisPlastik] = await connection.execute(
        'SELECT image_url FROM jenis_plastik WHERE id = ?',
        [id]
      );
      return jenisPlastik[0];
    } catch (error) {
      console.error('Error getting jenis plastik image:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = JenisPlastikModel;