import pool from "../config/db.js";
const LanguageStyleModel = {
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM language_styles WHERE id = ?",
        [id]
      );
      // 如果没有找到记录，返回 null
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error fetching language style:", error);
      throw new Error("Database error");
    }
  },
};
export default LanguageStyleModel;
