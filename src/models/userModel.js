const createConnection = require('../config/database');

class UserModel {
  static async create(email, hashedPassword, fullName) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
        [email, hashedPassword, fullName]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async updateProfile(userId, data) {
    let connection;
    try {
        connection = await createConnection();
        const [result] = await connection.execute(
            'UPDATE users SET full_name = ? WHERE id = ?',
            [data.full_name, userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
  }

  static async getUserProfile(userId) {
    let connection;
    try {
      connection = await createConnection();
      const [users] = await connection.execute(
        'SELECT full_name, email FROM users WHERE id = ?', 
        [userId]
      );
      return users[0];
    } catch (error) {
      console.error('Error finding user profile:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async updatePassword(userId, hashedPassword) {
    let connection;
    try {
        connection = await createConnection();
        await connection.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
  }

  static async findByEmail(email) {
    let connection;
    try {
      connection = await createConnection();
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ?', 
        [email]
      );
      return users[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async findById(id) {
    let connection;
    try {
      connection = await createConnection();
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return users[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async updateResetToken(userId, resetToken, resetTokenExpiry) {
    let connection;
    try {
      connection = await createConnection();
      const [result] = await connection.execute(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, resetTokenExpiry, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating reset token:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async findByResetToken(resetToken) {
    let connection;
    try {
      connection = await createConnection();
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [resetToken]
      );
      return users[0];
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  static async updatePassword(userId, hashedPassword) {
    let connection;
    try {
      connection = await createConnection();
      await connection.execute(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [hashedPassword, userId]
      );
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = UserModel;