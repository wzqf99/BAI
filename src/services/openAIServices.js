/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 11:20:40
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-06 11:20:56
 * @FilePath: \AI_node\src\services\openAIServices.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    // 这里使用了环境变量 DASHSCOPE_API_KEY 以及指定 baseURL
    this.openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }

  /**
   * 获取流式返回的大模型响应
   * @param {Array} messages - 聊天消息数组
   * @param {string} model - 模型名称, 如 "qwen-turbo"
   * @param {number} maxTokens - 返回的最大 token 数
   * @returns {AsyncGenerator} - 可异步迭代获取 chunk
   */
  async getChatCompletion(messages, model = "qwen-turbo", maxTokens = 150) {
    return this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      stream: true,
    });
  }
}

export default new OpenAIService();
