/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-21 14:49:32
 * @FilePath: \AI_node\src\models\articleModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";
import OpenAIService from "../services/openAIServices.js";
import ContentTemplateModel from "./ContentTemplateModel.js";
const articleModel = {
  // 获取文章类型 已完成
  async getArticleTypes() {
    const sql = "SELECT * FROM article_types";
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 获取文章语言风格 已完成
  async getLanguageStyles() {
    const sql = "SELECT * FROM language_styles";
    const [rows] = await pool.query(sql);
    return rows;
  },
  // 调用大模型生成文章草稿 已完成
  async generateDraft({
    articleType,
    languageStyle,
    contentTemplate,
    max_token,
  }) {
    // 如果业务需要验证 articleType / template 的正确性，可在此查询DB
    // 否则可直接使用参数组装 prompt
    const systemPrompt = `你是一位专业的写作助手。请按照以下要求生成文章。生成的字数:${max_token}`;
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
  async getArticles({ user_id, page = 1, pageSize = 8, search }) {
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

  // 获取某篇文章的详细信息 已完成
  async getArticleById(id) {
    console.log(`操作id为${id}文章`);
    const sql = `
    select 
    a.*,
    at.name as article_type,
    ls.name as language_style,
    ct.content as content_template
    from articles a
    left join article_types at on a.article_type_id = at.id
    left join language_styles ls on a.language_style_id = ls.id
    left join content_templates ct on a.content_template_id = ct.id
    where a.id = ?
    `;

    try {
      const [result] = await pool.query(sql, [id]);
      const row = result[0];
      return {
        id: row.id,
        userId: row.user_id,
        topicdId: row.topic_id,
        title: row.title,
        content: row.content,
        wordCount: row.word_count,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        languageStyle: {
          id: row.language_style_id,
          name: row.language_style,
        },
        articleType: {
          id: row.article_type_id,
          name: row.article_type,
        },
        contentTemplate: {
          id: row.content_template_id,
          content: row.content_template,
        },
      };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Error fetching article");
    }
  },
  // 更新整篇文章 已完成
  async updateArticle(id, article) {
    const {
      title,
      content,
      article_type_id,
      language_style_id,
      content_template,
      word_count,
    } = article;

    // 当前文章绑定的更新内容模板
    const { contentId, contentName } = content_template;
    const insertId = await ContentTemplateModel.updateUserInputToTemplate(
      parseInt(contentId),
      contentName
    );
    if (insertId) {
      console.log("更新内容模板成功");
    }

    const sql = `UPDATE articles SET
    title = ?,
    content = ?,
    article_type_id = ?,
    language_style_id = ?,
    content_template_id = ?,
    word_count = ?
    WHERE id = ?`;
    const values = [
      title,
      content,
      parseInt(article_type_id),
      parseInt(language_style_id),
      parseInt(contentId),
      parseInt(word_count),
      parseInt(id),
    ];
    const [result] = await pool.query(sql, values);
    return result;
  },

  // 删除文章 已完成
  async deleteArticle(id) {
    const sql = "DELETE FROM articles WHERE id = ?";
    const values = [parseInt(id)];
    const [result] = await pool.query(sql, values);
    return result;
  },

  // 局部更新文章(四种方式:精简,润色,续写,扩写)
  async rewriteArticle(action, text, style) {
    let responseStream;
    if (action === "shorten") {
      responseStream = OpenAIService.shortenText(text, style);
    } else if (action === "polish") {
      responseStream = OpenAIService.polishText(text, style);
    } else if (action === "continue") {
      responseStream = OpenAIService.continueText(text, style);
    } else if (action === "expand") {
      responseStream = OpenAIService.expandText(text, style);
    } else {
      throw new Error("Invalid action");
    }
    return responseStream;
  },
};
export default articleModel;
