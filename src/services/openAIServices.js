/*
 * @Author: yelan wzqf99@foxmail.com
 * @Date: 2025-02-06 11:20:40
 * @LastEditors: yelan wzqf99@foxmail.com
 * @LastEditTime: 2025-05-10 23:22:15
 * @FilePath: \AI_node\src\services\openAIServices.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }

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
        content: `你是一个专业编辑，请扩展以下内容至原来的1.5到2倍左右，同时保证此次生成的内容是完整的，增加细节描述使内容更丰富。保持原意但优化表达。风格要求：${style}。`,
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

  //  生成话题   qwen-max-0919 qwen-plus
  async generateTopic(context, model = "qwen-max-0919") {
    const prompt = `
根据以下信息生成话题(生成的话题是用于生成文章的prompt,一般是以用户的口吻来给予ai提示，要写什么，怎么写)：
标题: {title}
描述: {desc} （如果有）
输入: {input} （如果有）
根据上述信息，生成1个包含以下内容的 JSON 对象：
1. \`title\`: 生成的标题
2. \`contentmplate\`: 
   - \`id\`: -1
   - \`content\`: 生成的详细描述，拓展标题的内容，包含引导用户思路的信息
3. \`style\`: 选择一个合适的风格，选择一个值：
   - { "id": 1, "name": "正式" }
   - { "id": 2, "name": "热情" }
   - { "id": 3, "name": "简洁" }
   - { "id": 4, "name": "礼貌" }
   - { "id": 5, "name": "高情商" }
   - { "id": 6, "name": "口语化" }
4. \`type\`: 选择一个合适的文章类型，选择一个值：
   - { "id": 1, "name": "新闻" }
   - { "id": 2, "name": "博客" }
   - { "id": 3, "name": "教程" }
   - { "id": 4, "name": "知识科普" }
   - { "id": 5, "name": "故事" }
   - { "id": 6, "name": "活动宣传" }
   - { "id": 7, "name": "总结报告" }
   - { "id": 8, "name": "通用写作" }
   - { "id": 9, "name": "演讲稿" }
   - { "id": 10, "name": "经验分享" }
   - { "id": 11, "name": "情感共鸣" }

返回的格式应为 JSON，包含以下结构：

\`\`\`json
[
  {
    "title": "生成的标题",
    "content_template": {
      "id": -1,
      "content": "拓展描述内容"
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
]
\`\`\`
    `;
    const response = await this.openai.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        { role: "user", content: context },
      ],
    });

    // 处理返回的响应并提取话题
    if (
      response &&
      response.choices &&
      response.choices[0] &&
      response.choices[0].message
    ) {
      return response.choices[0].message.content;
    } else {
      throw new Error("生成话题失败，未能获取有效的返回数据");
    }
  }
}

export default new OpenAIService();
