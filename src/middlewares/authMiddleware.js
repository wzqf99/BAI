import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import jwtModel from "../models/jwtModel.js";

dotenv.config();
// 主要功能：验证 token 的合法性，是否过期，是否被篡改
// authorization是什么样的数据结构? 为什么用authHeader.split(" ")[1]？
//  1. authorization 是一个 HTTP 请求头，用于携带 token
//  2. 它的值通常是 "Bearer token" 的形式
// 3. 通过 split(" ") 可以将 "Bearer token" 拆分为 ["Bearer", "token"]
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "未提供 token" });
    }

    const token = authHeader.split(" ")[1];

    // 先在数据库中查找 token 记录
    const tokenRecord = await jwtModel.getTokenRecord(token);
    if (!tokenRecord) {
      return res.status(403).json({ error: "token 不存在或已失效" });
    }

    // 检查是否过期
    const now = new Date();
    if (tokenRecord.expired_at && now > tokenRecord.expired_at) {
      // tokenRecord 失效，删除数据库中的 token
      await jwtModel.deleteTokenRecord(token);
      return res.status(403).json({ error: "token 已过期" });
    }

    // 校验 token 的完整性 (签名是否正确)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将解码完的信息挂载到 req.user
    // 这个信息具体是? 为什么要挂载到req.user?
    // 1. decoded 是 jwt.sign 时传入的 payload
    // 2. 挂载到 req.user 是为了后续的中间件或路由处理函数能够方便地获取到用户信息
    // 3. 例如，后续的路由处理函数可以通过 req.user.userId 获取用户 ID
    // 4. 也可以通过 req.user.username 获取用户名
    // 5. 以此类推
    req.user = decoded;

    // 如果需要，也可以在这里更新 tokenRecord 的 last_used_at 之类的字段
    // ..

    // 继续执行下一个中间件
    next();
  } catch (error) {
    console.error("authMiddleware 错误:", error);
    return res.status(401).json({ error: "无效或过期的 token" });
  }
};

export default authMiddleware;
