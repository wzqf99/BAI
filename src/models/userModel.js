/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 11:02:52
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-06 15:31:50
 * @FilePath: \AI_node\src\models\userModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";
// userModel只负责用户相关的数据库操作,不涉及业务逻辑
const userModel = {
  // 根据 username 或 email 获取用户
  async getUserByNameOrEmail(usernameOrEmail) {
    //await pool.query(...) 返回的是一个数组，第一个元素是查询结果数据，第二个元素是元数据。
    //这里我们只需要查询结果数据，所以用解构赋值的方式取出第一个元素
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
      [usernameOrEmail, usernameOrEmail]
    );
    console.log(rows);
    return rows[0]; // 返回查询结果
  },

  // 新建用户
  async createUser(username, email, passwordHash) {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );
    return result.insertId; // 返回新插入记录的自增ID
  },

  // 根据ID获取用户
  async getUserById(userId) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return rows[0]; // 返回查询结果
  },

  // 其他操作: 更新/删除...
  async deleteById(userId) {
    const [rows] = await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    return rows.affectedRows > 0; // 返回是否删除成功
  },

  //
  async updateById(userId, username, email) {
    const [rows] = await pool.query(
      "UPDATE users SET username = ?, email = ? WHERE id = ?",
      [username, email, userId]
    );
    return rows.affectedRows > 0; // 返回是否更新成功
  },
};

export default userModel;
