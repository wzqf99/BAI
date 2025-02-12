import pool from "../config/db.js";
const ArticleTypeModel = {
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM article_types WHERE id = ?",
        [id]
      );
      // 如果没有找到记录，返回 null
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error fetching article type:", error);
      throw new Error("Database error");
    }
  },
};
export default ArticleTypeModel;
