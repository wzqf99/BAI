/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 11:20:40
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-02-26 15:12:32
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
  async getChatCompletion(messages, model = "deepseek-v3") {
    return this.openai.chat.completions.create({
      model,
      messages,
      /* max_tokens: maxTokens, */
      stream: true,
    });
  }
  /**
   * 获取流式返回的大模型响应
   * @param {string} text - 待润色的文本
   * @param {string} style - 文章风格
   */
  // 润色文本
  async polishText(text, style = "general") {
    const messages = [
      {
        role: "system",
        content: `你是一个专业编辑，请润色以下文本，字数与原来的文本相近，同时保证此次生成的内容是完整的，保持原意但优化表达。风格要求：${style}。`,
      },
      {
        role: "user",
        content: text,
      },
    ];
    return this.getChatCompletion(messages);
  }

  // 扩展文本
  async expandText(text, style = "general") {
    const messages = [
      {
        role: "system",
        content: `你是一个专业编辑，请扩展以下内容至原来的1.5倍左右，同时保证此次生成的内容是完整的，增加细节描述使内容更丰富。保持原意但优化表达。风格要求：${style}。`,
      },
      {
        role: "user",
        content: text,
      },
    ];
    return this.getChatCompletion(messages);
  }

  // 精简文本
  async shortenText(text, style = "general") {
    const messages = [
      {
        role: "system",
        content: `请简化以下内容，保留核心信息，同时保证此次生成的内容是完整的，精简到原长度的的0.4到0.7倍。风格要求：${style}。`,
      },
      {
        role: "user",
        content: text,
      },
    ];
    return this.getChatCompletion(messages);
  }

  // 续写文本
  async continueText(text, style = "general") {
    const messages = [
      {
        role: "system",
        content: `请根据以下内容继续撰写，保持风格连贯，续写约原来1.5到3倍左右文字的内容，必须保证要返回的内容是完整的。无视参数中max_tokens的值。风格要求：${style}。`,
      },
      {
        role: "user",
        content: text,
      },
    ];
    text.length;
    return this.getChatCompletion(messages);
  }
}

export default new OpenAIService();
