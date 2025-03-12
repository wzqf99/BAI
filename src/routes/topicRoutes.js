/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-03-11 16:34:55
 * @FilePath: \AI_node\src\routes\articleRoutes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Router } from "express";
import topicController from "../controllers/topicController.js";

const router = Router();

// 获取热门数据
router.get("/hotMessages", topicController.getHotMessages);

// 调用大模型根据参数生成话题
router.post("generateTopic", topicController.generateTopic);

// 用户收藏某个话题   需要用户收藏的同时将话题存储在话题表中
router.post("/collectTopic", topicController.collectTopic);

// 用户取消收藏话题
router.post("/cancelCollectTopic", topicController.cancelCollectTopic);

// 获取用户收藏的话题
router.get("/getCollectTopics", topicController.getCollectTopics);

// 导出路由
export default router;
