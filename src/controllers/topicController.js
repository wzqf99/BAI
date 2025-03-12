/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-03-12 16:30:56
 * @FilePath: \AI_node\src\controllers\topicController.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import topicModel from "../models/topicModel.js";
import OpenAIService from "../services/openAIServices.js";
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

  // 调用大模型根据参数生成话题
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

  // 用户收藏某个话题   需要用户收藏的同时将话题存储在话题表中
  async collectTopic() {},

  // 用户取消收藏话题
  async cancelCollectTopic() {},

  // 获取用户收藏的话题
  async getCollectTopics() {},
};
export default topicController;
