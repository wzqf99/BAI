/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 16:35:18
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-06 16:37:04
 * @FilePath: \AI_node\src\models\jwtModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";

const jwtModel = {
  // 在 jwt 表里插入一条记录
  async createTokenRecord(userId, token, expiredAt) {
    await pool.query(
      "INSERT INTO jwt_tokens (user_id, token, created_at, expired_at) VALUES (?, ?, NOW(), ?)",
      [userId, token, expiredAt]
    );
  },

  // 根据 token 查找记录
  async getTokenRecord(token) {
    const [rows] = await pool.query(
      "SELECT * FROM jwt_tokens WHERE token = ? LIMIT 1",
      [token]
    );
    return rows[0];
  },

  // 删除 token 记录（用户登出或 token 失效时可使用）
  async deleteTokenRecord(token) {
    await pool.query("DELETE FROM jwt_tokens WHERE token = ?", [token]);
  },

  // 也可以根据 userId 批量删除用户所有token (如果需要)
  async deleteAllTokensByUserId(userId) {
    await pool.query("DELETE FROM jwt_tokens WHERE user_id = ?", [userId]);
  },
};

export default jwtModel;
