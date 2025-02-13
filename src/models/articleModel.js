/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-13 16:14:33
 * @FilePath: \AI_node\src\models\articleModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";
import OpenAIService from "../services/openAIServices.js";
const articleModel = {
  // 调用大模型生成文章草稿 已完成
  async generateDraft({
    articleType,
    languageStyle,
    contentTemplate,
    max_token,
  }) {
    // 如果业务需要验证 articleType / template 的正确性，可在此查询DB
    // 否则可直接使用参数组装 prompt
    const systemPrompt = `你是一位专业的写作助手。请按照以下要求生成文章。`;
    const userPrompt = `
      文章类型:“${articleType}”，
      语言风格:“${languageStyle}”，
      生成的内容:"${contentTemplate}"。
      在文章标题的前后加上<h1>和</h1>标签。
      每个段落的前后加上<p>和</p>标签。
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 调用已封装的 openAIService，使用流式返回
    const responseStream = await OpenAIService.getChatCompletion(
      messages,
      "qwen-turbo", // 模型名称可自行替换
      max_token // maxTokens
    );

    // 返回流
    return responseStream;
  },

  // 获取文章列表 已完成
  async getArticles({ user_id, page = 1, pageSize = 10, search }) {
    // a.* 代表articles表的所有字段
    console.log("接收到参数", user_id, page, pageSize, search);
    let baseQuery = `
       select 
       a.id,
       a.title,
       a.created_at,
       a.updated_at,
       a.status,
       at.name as article_type
       from articles a
       inner join article_types at on a.article_type_id = at.id
       where a.user_id = ?
    `;
    // 用于存放查询参数
    const params = [user_id];
    const whereClauses = [];

    // 拼接搜索条件 联合搜索 文章标题 文章类型 文章状态 创建时间范围
    if (search) {
      if (search.title) {
        whereClauses.push(`a.title like ?`);
        params.push(`%${search.title}%`);
      }
      if (search.article_type) {
        whereClauses.push(`at.name = ?`);
        params.push(search.article_type);
      }
      if (search.status) {
        whereClauses.push(`a.status = ?`);
        params.push(search.status);
      }
      if (search.start_date) {
        whereClauses.push(`a.created_at >= ?`);
        params.push(search.start_date);
      }
      if (search.end_date) {
        whereClauses.push(`a.created_at <= ?`);
        params.push(search.end_date);
      }
    }

    // 拼接where条件
    if (whereClauses.length > 0) {
      baseQuery += " AND " + whereClauses.join(" AND ");
    }

    // 分页
    const offset = (page - 1) * pageSize;
    const limitQuery = ` LIMIT ? OFFSET ?`;
    const orderQuery = ` order by a.created_at desc`;

    // 总数查询
    const countQuery = `select count(*) as total from (${baseQuery}) as totalTable`;

    const articlesQuery = `${baseQuery}${orderQuery}${limitQuery}`;
    // 执行查询：获取文章列表
    try {
      // 执行查询：获取文章列表
      const [articles] = await pool.query(articlesQuery, [
        ...params,
        pageSize,
        offset,
      ]);

      // 执行查询：获取总记录数
      const [[{ total }]] = await pool.query(countQuery, params);

      // 返回数据
      return {
        data: articles.map((article) => ({
          ...article,
          created_at: article.created_at, // 转换为ISO格式 .toISOString()
          updated_at: article.updated_at, // 转换为ISO格式
        })),
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: Number(total),
          totalPages: Math.ceil(total / pageSize),
          hasMore: page * pageSize < total,
        },
      };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Error fetching articles");
    }
  },
  // 创建文章 已完成
  async createArticle(articleData) {
    const sql = `INSERT INTO articles (
      user_id, 
      topic_id, 
      article_type_id, 
      language_style_id, 
      content_template_id, 
      title, 
      content, 
      word_count, 
      status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      articleData.user_id,
      articleData.topic_id || null,
      articleData.article_type_id,
      articleData.language_style_id,
      articleData.content_template_id,
      articleData.title || "",
      articleData.content,
      articleData.word_count || 0,
      articleData.status || "draft",
    ];
    try {
      const result = await pool.query(sql, values);
      return result.insertId;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  // 获取某篇文章的详细信息
  async getArticleById(id) {
    const sql = "SELECT * FROM article WHERE id = ?";
    const [result] = await pool.execute(sql, [id]);
    return result;
  },
  // 更新整篇文章
  async updateArticle(id, article) {
    const { title, content } = article;
    const sql = "UPDATE article SET title = ?, content = ? WHERE id = ?";
    const [result] = await pool.execute(sql, [title, content, id]);
    return result;
  },
  // 删除文章
  async deleteArticle(id) {
    const sql = "DELETE FROM article WHERE id = ?";
    const [result] = await pool.execute(sql, [id]);
    return result;
  },
  // 局部更新文章
  async patchArticle(id, article) {
    const { title, content } = article;
    const sql = "UPDATE article SET title = ?, content = ? WHERE id = ?";
    const [result] = await pool.execute(sql, [title, content, id]);
    return result;
  },
};
export default articleModel;
