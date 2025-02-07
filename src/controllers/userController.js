import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import jwtModel from "../models/jwtModel.js";

dotenv.config();

const userController = {
  /**
   * 用户注册
   * @param {Object} req - 请求对象
   * @param {Object} req.body - 请求体
   * @param {string} req.body.username - 用户名
   * @param {string} req.body.email - 邮箱
   * @param {string} req.body.password - 密码
   * @param {Object} res - 响应对象
   * @returns {Object} - 返回注册结果或错误信息
   */
  // 注册
  async register(req, res) {
    try {
      console.log("收到注册请求", req.body);
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: "缺少必要字段" });
      }

      // 检查用户名或邮箱是否已存在
      const existingUser = await userModel.getUserByNameOrEmail(username);
      if (existingUser) {
        return res.status(409).json({ error: "用户名或邮箱已存在" });
      }

      // 加密密码
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 存储到数据库
      const newUserId = await userModel.createUser(
        username,
        email,
        passwordHash
      );

      return res.json({ message: "注册成功", userId: newUserId });
    } catch (error) {
      console.error("注册错误:", error);
      return res.status(500).json({ error: "服务器错误" });
    }
  },

  /**
   * 用户登录
   * @param {Object} req - 请求对象
   * @param {Object} req.body - 请求体
   * @param {string} req.body.usernameOrEmail - 用户名或邮箱
   * @param {string} req.body.password - 用户密码
   * @param {Object} res - 响应对象
   * @returns {Object} - 返回登录结果或错误信息
   */
  // 登录
  async login(req, res) {
    try {
      const { usernameOrEmail, password } = req.body;
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: "用户名/邮箱 或密码不能为空" });
      }

      // 1. 查询用户
      const user = await userModel.getUserByNameOrEmail(usernameOrEmail);
      if (!user) {
        return res.status(401).json({ error: "用户不存在或密码错误" });
      }

      // 2. 校验密码
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: "用户不存在或密码错误" });
      }

      // 3. 生成 token
      //    这里 Secret 仍在 .env 中，名称为 JWT_SECRET
      const expiresIn = "3000h"; // 你也可以用数字(单位为秒)或更灵活的表达
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      // 4. 计算过期时间(如果是 2h)
      const expiresAt = new Date(Date.now() + 3000 * 60 * 60 * 1000);

      // 5. 存储到数据库（原先若是写在环境变量，这里改为存表）
      await jwtModel.createTokenRecord(user.id, token, expiresAt);

      console.log(
        "登录成功,token生成成功,过期时间",
        user.username,
        token,
        expiresAt
      );
      // 6. 返回给前端
      return res.json({
        message: "登录成功",
        token,
        expiredAt: expiresAt,
      });
    } catch (error) {
      console.error("登录错误:", error);
      return res.status(500).json({ error: "服务器错误" });
    }
  },

  // 退出登录 需要前端传入 token
  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({ error: "缺少 token" });
      }

      const token = authHeader.split(" ")[1];

      // 删除数据库中的 token
      await jwtModel.deleteTokenRecord(token);

      return res.json({ message: "退出登录成功" });
    } catch (error) {
      console.error("退出登录错误:", error);
      return res.status(500).json({ error: "服务器错误" });
    }
  },
};

export default userController;
