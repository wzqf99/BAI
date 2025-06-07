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
/**
 * User model containing database operations for user management and statistics
 * 
 * Provides methods for:
 * - Basic user CRUD operations (create, read, update, delete)
 * - Article statistics (counts, types, word stats)
 * - Writing habit analysis (time patterns, style preferences)
 * - Favorite content tracking
 * - Content usage metrics
 * 
 * All methods return Promises that resolve with the requested data
 * Database operations are performed using a connection pool
 * 
 * @module userModel
 */
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

  // 更新通过id
  async updateById(userId, username, email) {
    const [rows] = await pool.query(
      "UPDATE users SET username = ?, email = ? WHERE id = ?",
      [username, email, userId]
    );
    return rows.affectedRows > 0; // 返回是否更新成功
  },

  // 新增方法 - 获取用户文章统计数据
  async getArticleStats(userId) {
    // 文章总数和时间分布
    const [articleStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        DATE_FORMAT(created_at, '%Y-%m') as month
      FROM articles 
      WHERE user_id = ? 
      GROUP BY month
      ORDER BY month`,
      [userId]
    );

    // 文章类型分布
    const [typeStats] = await pool.query(
      `SELECT 
        at.name as type_name,
        COUNT(*) as count
      FROM articles a
      JOIN article_types at ON a.article_type_id = at.id
      WHERE a.user_id = ?
      GROUP BY a.article_type_id`,
      [userId]
    );

    // 文章字数统计
    const [wordStats] = await pool.query(
      `SELECT 
        SUM(word_count) as total_words,
        AVG(word_count) as avg_words,
        MAX(word_count) as max_words,
        MIN(word_count) as min_words
      FROM articles
      WHERE user_id = ? AND word_count > 0`,
      [userId]
    );

    return {
      articleStats,
      typeStats,
      wordStats: wordStats[0],
    };
  },

  // 获取写作习惯统计
  async getWritingHabits(userId) {
    // 活跃时间段统计
    const [timeStats] = await pool.query(
      `SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as count
      FROM articles
      WHERE user_id = ?
      GROUP BY hour
      ORDER BY hour`,
      [userId]
    );

    // 语言风格偏好
    const [styleStats] = await pool.query(
      `SELECT 
        ls.name as style_name,
        COUNT(*) as count
      FROM articles a
      JOIN language_styles ls ON a.language_style_id = ls.id
      WHERE a.user_id = ?
      GROUP BY a.language_style_id
      ORDER BY count DESC`,
      [userId]
    );

    // 写作日期分布（按星期几）
    const [weekdayStats] = await pool.query(
      `SELECT 
        WEEKDAY(created_at) as weekday,
        COUNT(*) as count
      FROM articles
      WHERE user_id = ?
      GROUP BY weekday
      ORDER BY weekday`,
      [userId]
    );

    return {
      timeStats,
      styleStats,
      weekdayStats,
    };
  },

  // 获取收藏统计
  async getFavoriteStats(userId) {
    // 收藏话题统计
    const [favoriteStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_favorites,
        MAX(uf.created_at) as last_favorite_date
      FROM user_favorites uf
      WHERE uf.user_id = ?`,
      [userId]
    );

    // 收藏话题类型分布
    const [favoriteTypes] = await pool.query(
      `SELECT 
        at.name as type_name,
        COUNT(*) as count
      FROM user_favorites uf
      JOIN topics t ON uf.topic_id = t.id
      LEFT JOIN article_types at ON t.article_type_id = at.id
      WHERE uf.user_id = ?
      GROUP BY t.article_type_id`,
      [userId]
    );

    return {
      favoriteStats: favoriteStats[0],
      favoriteTypes,
    };
  },

  // 获取内容使用统计
  async getContentUsageStats(userId) {
    // 模板使用情况
    const [templateStats] = await pool.query(
      `SELECT 
        ct.id as template_id,
        COUNT(*) as usage_count
      FROM articles a
      JOIN content_templates ct ON a.content_template_id = ct.id
      WHERE a.user_id = ?
      GROUP BY a.content_template_id
      ORDER BY usage_count DESC
      LIMIT 5`,
      [userId]
    );

    // 话题到文章的转化率
    const [topicConversion] = await pool.query(
      `SELECT 
        COUNT(DISTINCT t.id) as total_topics,
        COUNT(DISTINCT a.topic_id) as converted_topics
      FROM user_favorites uf
      JOIN topics t ON uf.topic_id = t.id
      LEFT JOIN articles a ON a.topic_id = t.id AND a.user_id = ?
      WHERE uf.user_id = ?`,
      [userId, userId]
    );

    return {
      templateStats,
      topicConversion: topicConversion[0],
    };
  },
};

export default userModel;
