/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 11:00:26
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-04-14 22:26:31
 * @FilePath: \AI_node\src\routes\userRoutes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Router } from "express";
import userController from "../controllers/userController.js";

const router = Router();

// 注册
router.post("/register", userController.register);

// 登录
router.post("/login", userController.login);

// 登出
router.post("/logout", userController.logout);

router.get("/stats/articles", userController.getArticleStats);
router.get("/stats/writing-habits", userController.getWritingHabits);
router.get("/stats/favorites", userController.getFavoriteStats);
router.get("/stats/content-usage", userController.getContentUsageStats);
export default router;
