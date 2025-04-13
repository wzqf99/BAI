/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-03-13 19:35:58
 * @FilePath: \AI_node\src\routes\articleRoutes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Router } from "express";
import topicController from "../controllers/topicController.js";

const router = Router();

// 获取热门数据
router.get("/hotMessages", topicController.getHotMessages);

// 调用大模型根据参数生成话题
router.post("/generateTopic", topicController.generateTopic);

// 用户收藏某个话题(并不一定有话题id,所以将话题id和topic一起通过请求体传入) 同时将其保存到数据库
router.post("/:userId/collect", topicController.collectTopic);

// 用户取消收藏某个话题
router.delete("/:userId/collect/:topicId", topicController.cancelCollectTopic);

// 获取用户收藏的话题列表
router.get("/:userId/collect", topicController.getUserCollectTopic);

// 导出路由
export default router;
