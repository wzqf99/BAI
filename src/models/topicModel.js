/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-07 14:13:46
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-03-12 13:11:09
 * @FilePath: \AI_node\src\models\topicModel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import pool from "../config/db.js";
import OpenAIService from "../services/openAIServices.js";
import axios from "axios";

const topicModel = {
  // 获取热搜数据 已完成
  async getHotMessages() {
    const PLATFORMS = ["baidu", "douyin", "weibo", "zhihu", "bilihot"];
    const requests = PLATFORMS.map(async (type) => {
      try {
        const response = await axios.get(
          `https://api.cenguigui.cn/api/juhe/hotlist.php?type=${type}`
        );

        // 判断返回的数据格式
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error(`${type} 的返回数据格式不正确`);
        }

        return {
          [type]: response.data.data.map((item) => ({
            index: item.index,
            title: item.title || "无标题",
            url: item.url || item.mobilUrl || "#",
            ...(item.hot && { hot: item.hot }),
            ...(item.desc && { desc: item.desc }),
          })),
        };
      } catch (err) {
        console.error(`${type} 请求失败:`, err.message);
        return { [type]: [] }; // 发生错误时返回空数组
      }
    });

    const results = await Promise.all(requests);
    return Object.assign({}, ...results);
  },
};

export default topicModel;
