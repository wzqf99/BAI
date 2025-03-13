/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-03-13 19:30:13
 * @FilePath: \AI_node\src\controllers\topicController.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import topicModel from "../models/topicModel.js";
import OpenAIService from "../services/openAIServices.js";
import ContentTemplateModel from "../models/contentTemplateModel.js";
const topicController = {
  // 获取热搜数据 已完成
  async getHotMessages(req, res) {
    try {
      const data = await topicModel.getHotMessages();
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("控制器错误:", err);
      res.status(500).json({
        success: false,
        message: "服务器繁忙，请稍后重试",
      });
    }
  },

  // 调用大模型根据参数生成话题 已完成(可优化速度)
  async generateTopic(req, res) {
    console.time("时间");
    const { title } = req.body;
    let context = `根据以下信息生成话题(根据以下这些参数进行输出)：标题: ${title}`;
    console.log(req.body, "接收到了话题生成求情");

    if (req.body.desc) {
      const desc = req.body.desc;
      context = context + `描述: ${desc}`;
    }
    if (req.body.input) {
      const input = req.body.input;
      context = context + `输入: ${input}`;
    }
    if (!title) {
      return res.status(400).json({ error: "缺少必要的参数: title " });
    }

    try {
      // 调用 OpenAIService 生成话题
      const topic = await OpenAIService.generateTopic(context);
      console.log(topic, "未清洗的json");
      // 提取 JSON 部分(数据清洗)
      const jsonString = topic.replace(/^```json\n|\n```$/g, "");

      let jsonObject;
      try {
        jsonObject = JSON.parse(jsonString);
      } catch (error) {
        console.error("解析 JSON 时出错:", error);
        return res.status(500).json({ error: "话题内容解析失败" });
      }
      console.timeEnd("时间");
      // 返回生成的话题
      res.json({ jsonObject });
    } catch (error) {
      console.error("生成话题时出错:", error);
      res.status(500).json({ error: "生成话题时出错" });
    }
  },
  /* 
  {
  "id": null,  // 话题 ID（如果是新话题，前端传 null，后端创建后返回 ID）
  "title": "又一个千万人口大市诞生了",
  "content_template": {
    "id": null,  // 模板 ID（如果是新模板，前端传 null，后端创建后返回 ID）
    "content": "合肥市常住人口突破1000万..."
  },
  "style": {
    "id": 1,
    "name": "正式"
  },
  "type": {
    "id": 1,
    "name": "新闻"
  }
}
  */

  // 用户收藏某个话题   需要用户收藏的同时将话题存储在话题表中 已完成
  async collectTopic(req, res) {
    const userId = parseInt(req.params.userId);
    let { topicId, title, content_template, style, type } = req.body;
    if (!userId || !title || !content_template || !style || !type) {
      return res.status(400).json({ error: "缺少必要的参数" });
    }

    // 从刚生成的话题处收藏 需要保存内容模版 这样三个字段都完整了
    if (content_template.id === -1) {
      content_template.id = await ContentTemplateModel.saveUserInputToTemplate(
        content_template.content
      );
      console.log("保存内容模版成功", content_template.id);
    }

    // 从刚生成的话题处收藏 需要保存该话题
    if (topicId === -1) {
      topicId = await topicModel.saveTopic({
        title,
        content_template,
        style,
        type,
      });
      console.log("保存话题成功", topicId);
    }

    // 确保 topicId 和 userId 都有效
    if (!topicId || !userId) {
      return res.status(400).json({ error: "话题ID或用户ID无效" });
    }

    // 保存话题
    try {
      const data = await topicModel.collectTopic(topicId, userId);
      if (data) {
        console.log(`保存成功，收藏记录id为${data}`);
      }
      res.status(200).json({
        success: true,
        topic: {
          topicId,
          title,
          content_template,
          style,
          type,
        },
        timestamp: Date.now(),
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "服务器繁忙，请稍后重试",
      });
    }
  },

  // 用户取消收藏话题 已完成
  async cancelCollectTopic(req, res) {
    const userId = parseInt(req.params.userId);
    const { topicId } = req.body;
    if (!userId || !topicId) {
      return res.status(400).json({ error: "缺少必要的参数" });
    }
    try {
      const data = await topicModel.cancelCollectTopic(userId, topicId);
      if (!data) {
        return res.status(404).json({
          data: false,
          message: "用户没有收藏该话题，无法取消收藏",
        });
      }

      res.status(200).json({
        success: true,
        message: "取消收藏成功",
        topicId,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "服务器繁忙，请稍后重试",
      });
    }
  },

  // 获取用户收藏的话题 已完成
  async getUserCollectTopic(req, res) {
    const userId = parseInt(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: "缺少必要的参数" });
    }

    try {
      const userCollectTopic = await topicModel.getUserCollectTopic(userId);

      res.status(200).json({
        success: true,
        userCollectTopic,
        count: userCollectTopic.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器繁忙，请稍后重试",
      });
    }
  },
};
export default topicController;
