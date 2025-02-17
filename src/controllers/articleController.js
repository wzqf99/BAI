/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-17 12:24:27
 * @FilePath: \AI_node\src\controllers\articleController.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import articleModel from "../models/articleModel.js";
import ArticleTypeModel from "../models/ArticleTypeModel.js";
import LanguageStyleModel from "../models/LanguageStyleModel.js";
import ContentTemplateModel from "../models/ContentTemplateModel.js";
const articleController = {
  // 生成文章草稿 get 已完成 参数为文章类型，语言风格，内容模版，文字字数
  async generateDraft(req, res) {
    try {
      // 用 GET /generateArticleDraft?articleType=xx&languageStyle=xx...
      // 从 req.query 中取参数
      const { articleType, languageStyle, contentTemplate } = req.query;
      // 将max_token转为数字
      const max_token = parseInt(req.query.max_token);
      // 参数校验
      if (!articleType || !languageStyle || !contentTemplate) {
        return res.status(400).json({
          error: "缺少必要参数: articleType, languageStyle, contentTemplate",
        });
      }
      console.log("接收到了生成草稿请求");
      console.log("本次参数", articleType, languageStyle, max_token);
      // 调用模型生成结果(流式)
      const articleStream = await articleModel.generateDraft({
        articleType,
        languageStyle,
        contentTemplate,
        max_token,
      });

      // 设置SSE头
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // 逐段读取流，发送给前端
      for await (const chunk of articleStream) {
        const textChunk = chunk.choices?.[0]?.delta?.content ?? "";
        // SSE格式: data: <内容>\n\n
        res.write(`data: ${textChunk}\n\n`);
      }

      // 发送结束标志
      res.write("data: \n\n");
      res.end();
    } catch (error) {
      console.error("生成草稿出错:", error);
      res.write("data: [ERROR]\n\n");
      res.end();
    }
  },

  // 获取文章列表 get 已完成 参数为用户id,页码,每页数量,文章标题,文章类型,状态,开始日期,结束日期
  async getArticles(req, res) {
    console.log("接收到了获取文章列表请求", req.query);
    const {
      user_id,
      page = 1,
      pageSize = 10,
      title,
      article_type,
      status,
      start_date,
      end_date,
    } = req.query;
    // 参数验证
    if (!user_id) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing user_id parameter",
      });
    }

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid page number",
      });
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid page size (1-100)",
      });
    }

    try {
      const articles = await articleModel.getArticles({
        user_id: parseInt(user_id),
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        search: {
          title,
          article_type,
          status,
          start_date,
          end_date,
        },
      });
      res.status(200).json({
        statusCode: 200,
        message: "获取文章列表成功",
        data: articles.data,
        pagination: articles.pagination,
      });
    } catch (error) {
      console.error("Database error:", error); // 输出详细错误信息
      res.status(500).json({
        message: "Internal server error",
        error: error.message, // 返回错误信息以帮助排查
      });
    }
  },

  // 创建(保存)文章 post 已完成 参数为文章对象
  async createArticle(req, res) {
    // 检查请求体中是否包含必要的字段
    const requiredFields = [
      "user_id",
      "article_type_id",
      "language_style_id",
      "content_template",
      "content",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const {
      user_id,
      topic_id,
      article_type_id,
      language_style_id,
      content_template, // 用户的输入: content_template
      title,
      content,
      word_count,
      status,
    } = req.body;
    console.log("接收到了创建文章请求", req.body);

    // 保存用户输入的内容模板  同时获取相应的id  用于后续创建文章(保存文章到数据库)
    let styleId = await ContentTemplateModel.saveUserInputToTemplate(
      content_template
    );

    try {
      // 验证三个字段是否存在
      const [articleType, languageStyle, contentTemplate] = await Promise.all([
        ArticleTypeModel.getById(article_type_id),
        LanguageStyleModel.getById(language_style_id),
        ContentTemplateModel.getById(styleId),
      ]);
      if (!articleType)
        return res.status(400).json({ error: "Invalid article_type_id" });
      if (!languageStyle)
        return res.status(400).json({ error: "Invalid language_style_id" });
      if (!contentTemplate)
        return res.status(400).json({ error: "Invalid content_template_id" });

      // 验证可选topic_id
      /* if (topic_id) {
        const topic = await TopicModel.getById(topic_id);
        if (!topic) return res.status(400).json({ error: "Invalid topic_id" });
      } */

      const articleData = {
        user_id,
        topic_id: topic_id || null,
        article_type_id,
        language_style_id,
        content_template_id: styleId,
        title: title || "",
        content,
        word_count: parseInt(word_count) || 0,
        status: status || "draft",
      };

      const articleId = await articleModel.createArticle(articleData);
      return res.status(201).json({
        id: articleId,
        message: "文章创建成功",
        data: {
          ...articleData,
          id: articleId,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 获取某篇文章的详细信息 get 已完成 参数为文章id
  async getArticleById(req, res) {
    console.log("接收到了获取某篇文章的请求", req.params);
    let { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "缺少必要参数: articleId" });
    }
    try {
      const article = await articleModel.getArticleById(parseInt(id));
      return res.status(200).json({ data: article, message: "获取文章成功" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "服务器错误", details: error.message });
    }
  },

  // 更新文章信息 put 已完成 参数为文章对象和文章id
  async updateArticle(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    if (!id) {
      return res.status(400).json({ error: "缺少必要参数: articleId" });
    }
    if (!updateData) {
      return res.status(400).json({ error: "缺少更新数据 updateData" });
    }
    try {
      const { affectedRows, changedRows } = await articleModel.updateArticle(
        id,
        updateData
      );

      if (affectedRows === 0) {
        return res.status(404).json({ error: "文章不存在或更新失败" });
      }

      if (changedRows === 0) {
        return res.status(200).json({ message: "更新成功，但内容未更改" });
      }

      return res.status(200).json({ message: "更新文章成功" });
    } catch (error) {
      console.error("文章更新失败:", error);
      return res.status(500).json({ error: "服务器错误" });
    }
  },

  // 删除文章 delete 已完成 参数为文章id
  async deleteArticle(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "缺少必要参数: articleId" });
    }
    try {
      const { affectedRows } = await articleModel.deleteArticle(id);
      if (affectedRows === 0) {
        return res.status(404).json({ error: "文章不存在或删除失败" });
      }
      return res.status(200).json({ message: "删除文章成功" });
    } catch (error) {
      console.error("文章删除失败:", error);
      return res.status(500).json({ error: "服务器错误" });
    }
  },

  // 局部重写文章 patch
  async patchArticle(req, res) {},
};
export default articleController;
