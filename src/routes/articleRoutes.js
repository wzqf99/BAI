/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-14 16:55:15
 * @FilePath: \AI_node\src\routes\articleRoutes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Router } from "express";
import articleController from "../controllers/articleController.js";

const router = Router();

// 获取文章类型和语言风格
router.get("/types", articleController.getArticleTypes);
router.get("/styles", articleController.getLanguageStyles);

// 前端向这里发请求,以query方式传入文章类型，语言风格，内容模版，文字字数，
// 如果文章类型，语言风格，内容模版是通过话题传入的。
// 生成文章草稿(调用大模型输入参数生成content,返回content到前端) 已完成
router.get("/generateArticleDraft", articleController.generateDraft);

// 保存文章 已完成
router.post("/createArticle", articleController.createArticle);

// 局部更新文章(四种方式:精简,润色,续写,扩写) 已完成
router.get("/rewriteText", articleController.reWriteArticle);

// 获取文章列表 已完成
router.get("/articleList", articleController.getArticles);
/*  (req, res, next) => {
    console.log("articleList route reached"); // 测试路由是否可达
    next();
  }, */

// 获取某篇文章的详细信息 已完成
router.get("/:id", articleController.getArticleById);

// 更新整篇文章 已完成
router.put("/:id", articleController.updateArticle);

// 删除文章 已完成
router.delete("/:id", articleController.deleteArticle);

// 导出路由
export default router;
