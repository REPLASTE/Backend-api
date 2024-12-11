const createConnection = require('../config/database');

class RecyclingLocationModel {
  static async create(name, address, phoneNumber, gmapsLink, imageUrl, fileName) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'INSERT INTO recycling_locations (name, address, phone_number, gmaps_link, image_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
        [name, address, phoneNumber, gmapsLink, imageUrl, fileName]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating recycling location:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async getAll() {
    let connection;
    try {
      connection = await createConnection();
      const [locations] = await connection.execute(
        'SELECT name, address, phone_number, gmaps_link FROM recycling_locations ORDER BY created_at DESC'
      );
      return locations;
    } catch (error) {
      console.error('Error getting recycling locations:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async getById(id) {
    let connection;
    try {
      connection = await createConnection();
      const [locations] = await connection.execute(
        'SELECT name, address, phone_number, gmaps_link FROM recycling_locations WHERE id = ?',
        [id]
      );
      return locations[0];
    } catch (error) {
      console.error('Error getting recycling location:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async getImageById(id) {
    let connection;
    try {
      connection = await createConnection();
      const [locations] = await connection.execute(
        'SELECT image_url FROM recycling_locations WHERE id = ?',
        [id]
      );
      return locations[0];
    } catch (error) {
      console.error('Error getting recycling location:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async update(id, name, address, phoneNumber, gmapsLink, imageUrl, fileName) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'UPDATE recycling_locations SET name = ?, address = ?, phone_number = ?, gmaps_link = ?, image_url = ?, file_name = ? WHERE id = ?',
        [name, address, phoneNumber, gmapsLink, imageUrl, fileName, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating recycling location:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async delete(id) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'DELETE FROM recycling_locations WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting recycling location:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = RecyclingLocationModel;