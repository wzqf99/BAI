import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "123456",
  database: process.env.DB_NAME || "chuangzuo",
  waitForConnections: true,
  connectionLimit: 10, // 连接池中最大连接数
  queueLimit: 0, // 最大排队请求数，0表示不限制
});

export default pool;
