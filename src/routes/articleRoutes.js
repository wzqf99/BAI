import { Router } from "express";
import articleController from "../controllers/articleController.js";

const router = Router();

// 前端向这里发请求,以query方式传入文章类型，语言风格，内容模版，文字字数，
// 如果文章类型，语言风格，内容模版是通过话题传入的。
// 生成文章草稿(调用大模型输入参数生成content,返回content到前端) 已完成
router.get("/generateArticleDraft", articleController.generateDraft);

// 保存文章 已完成
router.post("/createArticle", articleController.createArticle);

// 获取文章列表 未完成
router.get("/article", articleController.getArticles);

// 获取某篇文章的详细信息 未完成
router.get("/article/:id", articleController.getArticleById);

// 更新整篇文章 未完成
router.put("/article/:id", articleController.updateArticle);

// 删除文章 未完成
router.delete("/article/:id", articleController.deleteArticle);

// 更新局部文章 未完成
router.patch("/article/:id", articleController.patchArticle);

// 导出路由
export default router;
