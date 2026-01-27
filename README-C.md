#### 後端檔案,先看這2個簡單的了解API運作流程

遊戲連結: https://hexschool.github.io/backend-camp-game/
第9天 後端CRUD

skill
---
backend/routes/skill.js
backend/controllers/skill.js

admin
---
backend/routes/admin.js
backend/controllers/admin.js

#### 修改Entity檔案
```
# 初始化資料庫結構（同步 TypeORM Entity 到資料庫）
npm run init:schema
---

你改 Entity（程式碼）
        ↓
npm run init:schema
        ↓
TypeORM 連到資料庫
        ↓
直接 CREATE / ALTER TABLE
        ↓
資料庫本身「被改了」
```
