/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-03-12 12:37:08
 * @FilePath: \AI_node\src\controllers\topicController.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import topicModel from "../models/topicModel.js";
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
  async generateTopic() {},

  // 用户收藏某个话题   需要用户收藏的同时将话题存储在话题表中
  async collectTopic() {},

  // 用户取消收藏话题
  async cancelCollectTopic() {},

  // 获取用户收藏的话题
  async getCollectTopics() {},
};
export default topicController;
