/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-12 11:48:29
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-12 12:59:57
 * @FilePath: \AI_node\src\models\ContentTemplateModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";
const ContentTemplateModel = {
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM content_templates WHERE id = ?",
        [id]
      );
      // 如果没有找到记录，返回 null
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error fetching content template:", error);
      throw new Error("Database error");
    }
  },

  // 保存用户输入的内容模板
  async saveUserInputToTemplate(userInput) {
    const sql = "INSERT INTO content_templates (content) VALUES (?)";
    const [result] = await pool.query(sql, [userInput]);
    return result.insertId; // 返回新创建的模板 ID
  },
};
export default ContentTemplateModel;
