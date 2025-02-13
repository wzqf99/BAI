/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 10:59:52
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-13 15:36:59
 * @FilePath: \AI_node\src\routes\router.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Router } from "express";
import dotenv from "dotenv";
import openAIService from "../services/openAIServices.js"; // 引入封装好的 AI 服务
import userRoutes from "./userRoutes.js"; // 引入用户路由
import authMiddleware from "../middlewares/authMiddleware.js"; // 引入鉴权中间件
import articleRoutes from "./articleRoutes.js"; // 引入文章路由

dotenv.config(); // 加载环境变量

const router = Router();

router.use("/user", userRoutes); // 注册用户路由
router.use("/article", articleRoutes); // 注册文章路由

// 以下路由需要登录后才能访问  使用 authMiddleware 中间件 (验证 token) 全局鉴权
/* router.use(authMiddleware); */
// 其他路由可在此添加，例如：

export default router;

// 示例测试接口 测试流式数据返回 SSE服务端推送

/* router.get("/test", async (req, res) => {
  console.log("接收到了测试请求");
  // 指定返回格式为 text/event-stream
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. 从 req.query 中拿到序列化的 messages
    const { messages: rawMessages } = req.query;
    if (!rawMessages) {
      res.write(`data: [SSE Error] messages 参数为空\n\n`);
      return res.end();
    }

    // 2. 解析为 JS 数组
    let messages;
    try {
      messages = JSON.parse(rawMessages);
    } catch (parseErr) {
      res.write(`data: [SSE Error] JSON解析失败: ${parseErr.message}\n\n`);
      return res.end();
    }

    console.log("前端发来的 messages:", messages);

    // 3. 调用大模型 (以 qwen-turbo 为例)
    const completion = await openAIService.getChatCompletion(
      messages,
      "qwen-turbo"
    );

    // 4. 流式返回
    for await (const chunk of completion) {
      const content = chunk?.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${content}\n\n`);
      }
    }

    // 5. 结束 SSE
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.write(`data: [SSE Error]: ${error.message}\n\n`);
    res.end();
  }
}); */
