import { Router } from "express";
import articleController from "../controllers/articleController.js";

const router = Router();

// 生成文章
router.post("/createArticle", articleController.createArticle);

// 获取文章列表
router.post("/login", articleController.login);

// 登出
router.post("/logout", articleController.logout);
export default router;
