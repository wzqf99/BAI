## 文创生成平台接口(deepseek r1 生成)

1. 配置信息
   - [1.1 获取文章类型]
   - [1.2 获取语言风格]
2. 文章生成
   - [2.1 生成文章草稿（流式）]
3. 文章操作
   - [3.1 保存文章]
   - [3.2 获取文章列表]
   - [3.3 获取单篇文章]
   - [3.4 更新文章]
   - [3.5 删除文章]
4. 文本处理
   - [4.1 文本重写（流式）]
5. [错误响应]

## 1.配置信息

### 1.1 获取文章类型

**URL**: `/api/article/types`
**方法**: GET

**响应**:

json

复制

```
{
  "data": [
    { "id": 1, "name": "技术文章" },
    { "id": 2, "name": "生活随笔" }
  ]
}
```

### 1.2 获取语言风格

**URL**: `/api/article/styles`
**方法**: GET

**响应**:

json

复制

```
{
  "data": [
    { "id": 1, "name": "正式" },
    { "id": 2, "name": "幽默" }
  ]
}
```

## 2.文章生成

### 2.1 生成文章草稿（流式）

**URL**: `/api/article/generateArticleDraft`
**方法**: GET

**参数**:

| 参数名          | 必选 | 类型   | 说明                                   |
| --------------- | ---- | ------ | -------------------------------------- |
| articleType     | 是   | string | 文章类型（需与配置接口返回的类型一致） |
| languageStyle   | 是   | string | 语言风格（需与配置接口返回的风格一致） |
| contentTemplate | 是   | string | 内容模板描述（如："关于春天的散文"）   |
| max_token       | 是   | number | 生成的最大字数                         |

**示例请求**:

bash

复制

```
GET /api/article/generateArticleDraft?articleType=技术文章&languageStyle=正式&contentTemplate=人工智能发展趋势&max_token=500
```

**响应说明**：
使用 Server-Sent Events (SSE) 流式返回生成的文本内容，格式为：

text

复制

```
data: 生成的内容片段\n\n
```

## 3.文章操作

### 3.1 保存文章

**URL**: `/api/article/createArticle`
**方法**: POST

**请求体**:

json

复制

```
{
  "user_id": 123,
  "article_type_id": 1,
  "language_style_id": 1,
  "content_template": "用户输入的内容模板",
  "title": "文章标题",
  "content": "文章内容",
  "word_count": 800,
  "status": "draft"
}
```

**必填字段**：`user_id`, `article_type_id`, `language_style_id`, `content_template`

**成功响应**:

json

复制

```
{
  "success": true,
  "message": "文章创建成功",
  "data": {
    "id": 456,
    "user_id": 123,
    "title": "文章标题",
    "content": "文章内容"
  }
}
```

### 3.2 获取文章列表

**URL**: `/api/article/articleList`
**方法**: GET

**参数**:

| 参数名       | 必选 | 类型   | 说明                           |
| ------------ | ---- | ------ | ------------------------------ |
| user_id      | 是   | number | 用户 ID                        |
| page         | 否   | number | 页码（默认 1）                 |
| pageSize     | 否   | number | 每页数量（默认 8，最大 100）   |
| title        | 否   | string | 标题搜索关键词                 |
| article_type | 否   | string | 文章类型名称过滤               |
| status       | 否   | string | 状态过滤（draft/published）    |
| start_date   | 否   | string | 创建时间范围开始（YYYY-MM-DD） |
| end_date     | 否   | string | 创建时间范围结束（YYYY-MM-DD） |

**示例请求**:

bash

复制

```
GET /api/article/articleList?user_id=123&page=2&article_type=技术文章
```

**响应**:

json

复制

```
{
  "statusCode": 200,
  "message": "获取文章列表成功",
  "data": [
    {
      "id": 456,
      "title": "AI技术发展",
      "article_type": "技术文章",
      "created_at": "2024-03-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "pageSize": 8,
    "total": 25,
    "totalPages": 4,
    "hasMore": true
  }
}
```

### 3.3 获取单篇文章

**URL**: `/api/article/{id}`
**方法**: GET

**路径参数**:

| 参数名 | 必选 | 类型   | 说明    |
| ------ | ---- | ------ | ------- |
| id     | 是   | number | 文章 ID |

**响应**:

json

复制

```
{
  "data": {
    "id": 456,
    "title": "人工智能未来",
    "content": "<h1>人工智能发展</h1><p>正文内容...</p>",
    "languageStyle": { "id": 1, "name": "正式" },
    "articleType": { "id": 1, "name": "技术文章" }
  }
}
```

### 3.4 更新文章

**URL**: `/api/article/{id}`
**方法**: PUT

**路径参数**:

| 参数名 | 必选 | 类型   | 说明    |
| ------ | ---- | ------ | ------- |
| id     | 是   | number | 文章 ID |

**请求体**:

json

复制

```
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "article_type_id": 2,
  "language_style_id": 2
}
```

**响应**:

json

复制

```
{
  "message": "更新文章成功"
}
```

### 3.5 删除文章

**URL**: `/api/article/{id}`
**方法**: DELETE

**路径参数**:

| 参数名 | 必选 | 类型   | 说明    |
| ------ | ---- | ------ | ------- |
| id     | 是   | number | 文章 ID |

**响应**:

json

复制

```
{
  "message": "删除文章成功"
}
```

## 4.文本处理

### 4.1 文本重写（流式）

**URL**: `/api/article/rewriteText`
**方法**: GET

**参数**:

| 参数名 | 必选 | 类型   | 说明                                       |
| ------ | ---- | ------ | ------------------------------------------ |
| action | 是   | string | 操作类型（shorten/polish/continue/expand） |
| text   | 是   | string | 要处理的文本内容                           |
| style  | 是   | string | 目标风格（如"正式"）                       |

**示例请求**:

bash

复制

```
GET /api/article/rewriteText?action=polish&style=正式&text=需要润色的文本内容
```

**响应说明**：
使用 SSE 流式返回处理后的文本内容，格式与生成草稿接口相同。

## 错误响应

所有接口统一错误格式：

json

复制

```
{
  "error": "错误描述",
  "details": "具体错误信息（可选）"
}
```

**常见状态码**:

- 400: 参数验证失败
- 404: 资源不存在
- 500: 服务器内部错误

> **注意**：流式接口（`generateArticleDraft`/`rewriteText`）需要使用 `EventSource` 接收数据
> 示例前端代码：
>
> javascript
>
> 复制
>
> ```
> const eventSource = new EventSource('/api/article/generateArticleDraft?...')
> eventSource.onmessage = (e) => {
>   console.log('Received chunk:', e.data)
> }
> ```
