/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-04-12 11:07:52
 * @FilePath: \AI_node\src\models\topicModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";
import OpenAIService from "../services/openAIServices.js";
import axios from "axios";

const topicModel = {
  // 获取热搜数据 已完成
  async getHotMessages() {
    const PLATFORMS = ["baidu", "douyin", "weibo", "zhihu", "bilihot"];
    const requests = PLATFORMS.map(async (type) => {
      try {
        const response = await axios.get(
          `https://api.cenguigui.cn/api/juhe/hotlist.php?type=${type}`
        );

        // 判断返回的数据格式
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error(`${type} 的返回数据格式不正确`);
        }

        return {
          [type]: response.data.data.map((item) => ({
            index: item.index,
            title: item.title || "无标题",
            url: item.url || item.mobilUrl || "#",
            ...(item.hot && { hot: item.hot }),
            ...(item.desc && { desc: item.desc }),
          })),
        };
      } catch (err) {
        console.error(`${type} 请求失败:`, err.message);
        return { [type]: [] }; // 发生错误时返回空数组
      }
    });

    const results = await Promise.all(requests);
    return Object.assign({}, ...results);
  },

  // 保存话题 已完成
  async saveTopic(topic) {
    const {
      title,
      content_template: { id: contentTemplateId },
      type: { id: articleTypeId },
      style: { id: languageStyleId },
    } = topic;
    const sql = `
    INSERT INTO topics (title, content_template_id, article_type_id, language_style_id)
    VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
      title,
      contentTemplateId,
      articleTypeId,
      languageStyleId,
    ]);
    return result.insertId;
  },

  // 用户收藏某话题 已完成
  async collectTopic(topicId, userId) {
    console.log("收藏话题的用户为${userId},收藏的话题为${topicId}");
    const sql = `INSERT INTO user_favorites (user_id, topic_id) VALUES (?, ?);`;

    try {
      const [result] = await pool.query(sql, [userId, topicId]);
      return result.insertId;
    } catch (error) {
      console.error("收藏话题失败:", error);
      throw new Error("收藏话题失败");
    }
  },

  // 检查是否收藏过了
  async checkIfAlreadyCollected(topicId, userId) {
    const sql = "SELECT * FROM user_favorites WHERE user_id = ? AND topic_id = ? LIMIT 1";
    const [rows] = await pool.query(sql, [userId, topicId]);
    return rows.length > 0;
  },
  // 用户取消收藏某话题 已完成
  async cancelCollectTopic(userId, topicId) {
    console.log(`用户 ${userId} 取消收藏话题 ${topicId}`);
    const sql = `DELETE FROM user_favorites WHERE user_id = ? AND topic_id = ?;`;
    try {
      const [result] = await pool.query(sql, [userId, topicId]);
      if (result.affectedRows === 0) {
        console.warn(`取消收藏失败：用户 ${userId} 没有收藏话题 ${topicId}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("取消收藏失败:", error);
      throw new Error("取消收藏失败");
    }
  },

  // 获取某个用户收藏的话题列表 已完成
  async getUserCollectTopic(userId) {
    console.log(`获取用户 ${userId} 的收藏列表`);
    const sql = `SELECT 
    t.id AS topicId, 
    t.title, 
    ct.id AS contentTemplateId, 
    ct.content AS contentTemplate,
    s.id AS styleId, 
    s.name AS styleName,
    ty.id AS typeId, 
    ty.name AS typeName
    FROM user_favorites uf
    JOIN topics t ON uf.topic_id = t.id
    LEFT JOIN content_templates ct ON t.content_template_id = ct.id
    LEFT JOIN language_styles s ON t.language_style_id = s.id
    LEFT JOIN article_types ty ON t.article_type_id = ty.id
    WHERE uf.user_id = ?;`;
    try {
      const [rows] = await pool.query(sql, [userId]);

      // **转换格式**
      return rows.map((row) => ({
        id: row.topicId,
        title: row.title,
        content_template: {
          id: row.contentTemplateId,
          content: row.contentTemplate,
        },
        style: {
          id: row.styleId,
          name: row.styleName,
        },
        type: {
          id: row.typeId,
          name: row.typeName,
        },
      }));
    } catch (error) {
      console.error("获取用户收藏列表失败:", error);
      throw new Error("获取用户收藏列表失败");
    }
  },

  
};

export default topicModel;
