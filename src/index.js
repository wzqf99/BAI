import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/router.js"; // 引入路由模块
import pool from "./config/db.js"; // 如果需要初始化数据库连接，可提前引用

dotenv.config(); // 加载环境变量

const app = express();
const port = process.env.PORT || 3000;

// 使用中间件，处理 JSON 请求体
app.use(express.json());

// 使用 CORS
app.use(cors());

// 测试数据库连接（可选）
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL 数据库连接成功");
    connection.release();
  } catch (error) {
    console.error("MySQL 数据库连接失败:", error.message);
  }
})();

// 注册路由
app.use("/api", router);

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
