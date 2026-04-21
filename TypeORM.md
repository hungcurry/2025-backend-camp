


- **ORM**: 
- TypeORM
- Prisma


#### ORM 框架-TypeORM
> 指令
```bash
npm install typeorm pg reflect-metadata

# typeorm: 核心 ORM 框架。
# pg: PostgreSQL 的 Node.js 驅動程式
# reflect-metadata: TypeORM 運作必備的裝飾器/元數據支援套件
```

```jsx
src/
├─ data-source.js
├─ entity/
│  ├─ Skill.js
│  └─ Class.js
├─ app.js
├─ crud.js
```

```jsx
// src/data-source.js
// TypeORM 必要套件
const { DataSource } = require('typeorm')

// Entity
const Skill = require('./entity/Skill')
// const Class = require('./entity/Class')

// 建立資料庫連線設定
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'school',

  synchronize: true, // 開發期使用，可自動更新資料表
  logging: false,    // 是否輸出 SQL 日誌

  entities: [
    Skill,
    Class,
  ],
})
module.exports = AppDataSource
```

```jsx
// src/entity/Skill.js
const { EntitySchema } = require('typeorm')
module.exports = new EntitySchema({
  name: 'Skill',       // Entity 名稱
  tableName: 'SKILL',  // 對應資料表名稱
  columns: {
    id: {
      primary: true,      // 主鍵 (每筆資料唯一)
      type: 'uuid',       // UUID 型別
      generated: 'uuid',  // 新增資料時自動生成 UUID
      nullable: false,    // 不可為空值
    },
    name: {
      type: 'varchar',    // 字串型別
      length: 50,         // 最大長度 50
      unique: true,       // 唯一性約束
      nullable: false,    // 不可為空值
    },
    createdAt: {
      type: 'timestamp',  // 時間戳記
      createDate: true,   // 自動填入第一次存入時間
      name: 'created_at', // 資料庫欄位名稱
      nullable: false,    // 不可為空值
    },

    常用20屬性: {
      type: 'varchar',        // 欄位資料型別 (字串/integer/uuid/boolean/date 等)
      type: 'integer',        // 整數型別
      length: 50,             // 字串最大長度 (varchar / char)
      nullable: false,        // 不可以為空值
      unique: true,           // 唯一性約束：不能出現兩筆一樣的值
                              // user1@gmail.com
                              // user1@gmail.com   ❌ 重複
      default: 'guest',       // 預設值
      primary: true,          // 主鍵 (每筆資料唯一)
      type: 'uuid',           // UUID 型別
      generated: 'uuid',      // 自動生成值 (uuid / increment)
      comment: '使用者名稱',   // 欄位註解 (DB comment)

      select: false,          // 查詢時預設不回傳 (常用於 password)
      update: false,          // 更新時忽略此欄位
      insert: false,          // 新增時忽略此欄位
      precision: 10,          // 數字總位數 (decimal)
      scale: 2,               // 小數位數 (decimal)
    }
    createdAt: {
      type: 'timestamp',  // 時間戳記
      createDate: true,   // 新增時自動寫入時間
      updateDate: true,   // 更新時自動更新時間
      deleteDate: true,   // soft delete 時寫入時間
    }
    // DB 用 snake_case => created_at
    // JS 用 camelCase => createdAt
    // 2者用法不同,所以特別重取
    createdAt: {
      type: 'timestamp',
      name: 'created_at', // 指定「資料庫裡」的欄位名稱。
    }
  },
  relations: {
    // 與 User 資料表的關聯
    User: {
      target: 'User', // 目標 Entity，也就是關聯的資料表是 User
      type: 'many-to-one', // 關聯型態：多對一 (多個 Order 對應到一個 User)
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'user_id', // 本表對應的欄位名稱 (Order 表的 user_id)
        referencedColumnName: 'id', // 對方表 (User) 的主鍵欄位名稱
        foreignKeyConstraintName: 'order_user_id_fk' // 外鍵約束名稱
      }
    },

    // 與 CreditPackage 資料表的關聯
    CreditPackage: {
      target: 'CreditPackage', // 目標 Entity，是 CreditPackage
      type: 'many-to-one', // 多個 Order 對應到一個 CreditPackage
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'credit_package_id', // 本表欄位名稱 (Order 表的 credit_package_id)
        referencedColumnName: 'id', // 對方表主鍵欄位 (CreditPackage 的 id)
        foreignKeyConstraintName: 'order_credit_package_id_fk' // 外鍵名稱
      }
    }
  }
})
```


> relations 如何看

```jsx
// 原生PostgreSQL寫法
1. order 表（自己表）
---
| id (PK) | user_id (FK) | amount |
| ------- | ------------ | ------ |
| 101     | 1            | 500    |
| 102     | 2            | 300    |


2. user 表（對方表）
---
| id (PK) | name |
| ------- | ---- |
| 1       | Tom  |
| 2       | Mary |

// PostgreSQL 會把 未加引號的名稱全部轉小寫
// 
// -- 外來鍵 foreign / 參考 references
// -- 設定外來鍵關聯
// FOREIGN KEY (user_id) REFERENCES user(id)
// --------------------------------------
// 原本原生寫法
// FOREIGN KEY (user_id)
// REFERENCES user(id)
// CONSTRAINT order_user_id_fk (通常會省略這行...)

-- 建立 order 表（自己表）
CREATE TABLE order (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,

    -- 外來鍵關聯
    FOREIGN KEY (user_id)
    REFERENCES user(id)
    // 通常會省略這行...
    -- CONSTRAINT order_user_id_fk
);

-- 建立 user 表（對方表）
CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
```

```jsx
// 對應 typeorm 寫法
  name: 'Order', // Entity 名稱
  tableName: 'order', // 對應資料表名稱
  columns: {
    id: {
      primary: true, // 主鍵 (每筆資料唯一)
      type: 'integer', // 整數型別
      nullable: false // 不可為空值
    },
    user_id: {
      type: 'integer',
      nullable: false
    },
    amount: {
      type: 'integer',
      nullable: false
    },
  },
relations: {
  user: {
    ...
    //
    // joinColumn 每個屬性是誰寫誰
    // | 屬性                       | 是誰的欄位         | 寫在哪個表 | 作用   |
    // | ------------------------ | ------------- | ----- | --------------- |
    // | name                     | 自己表           | order | 建立 `user_id` 欄位 |
    // | referencedColumnName     | 對方表           | user  | 指向 `id` 欄位      |
    // | foreignKeyConstraintName | constraint 名稱 | order | 外鍵名稱            |

    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'order_user_id_fk'
    }
  }
}
```


```jsx
// src/app.js
const AppDataSource = require('./data-source')
async function start() {
  try {
    await AppDataSource.initialize()
    console.log('✅ DB connected')
  } catch (error) {
    console.error('❌ DB connection failed:', error)
  }
}
start()
```


```jsx
// src/crud.js 使用檔案
const AppDataSource = require('./data-source')

async function runCRUD() {
  try {
    // 如果尚未初始化，才初始化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('✅ DB connected')
    }

    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    const skillRepo = AppDataSource.getRepository('Skill')

    // ✅ Create
    const skill = await skillRepo.save({ name: 'NodeJS' })
    console.log('Created:', skill)

    // ✅ Read all
    const allSkills = await skillRepo.find()
    console.log('All Skills:', allSkills)

    // ✅ Read one
    const oneSkill = await skillRepo.findOneBy({ id: skill.id })
    console.log('One Skill:', oneSkill)

    // ✅ Update
    await skillRepo.update({ id: skill.id }, { name: 'TypeScript' })
    const updatedSkill = await skillRepo.findOneBy({ id: skill.id })
    console.log('Updated Skill:', updatedSkill)

    // ✅ Delete
    await skillRepo.delete({ id: skill.id })
    const afterDelete = await skillRepo.find()
    console.log('After Delete:', afterDelete)

  } 
  catch (error) {
    console.error('❌ CRUD operation failed:', error)
  } 
}
runCRUD()
```













#### ORM 框架-Prisma
> 指令
```bash
npm install prisma @prisma/client
npx prisma init
```

```jsx
src/
prisma/
├─ schema.prisma
├─ app.js
├─ crud.js
├─ prisma.config.js
```

```jsx
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}
// 定義資料庫連線設定
datasource db {
  // 指定資料庫類型為 PostgreSQL
  provider = "postgresql"
}
model Skill {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   @unique @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("SKILL") // 對應資料庫表名
}
// 解說屬性
// ------
// model Skill {
// id 欄位
// @id: 標記為主鍵 (Primary Key)
// @default(uuid()): 預設值由 Prisma 自動產生 UUID
// @db.Uuid: 指定資料庫底層使用 UUID 資料型別 (適用於 PostgreSQL)
// ~id        String   @id @default(uuid()) @db.Uuid

// name 欄位
// @unique: 設定唯一約束，不允許重複的技能名稱
// @db.VarChar(50): 指定資料庫底層為字串型別，且最大長度為 50
// ~name      String   @unique @db.VarChar(50)

// createdAt 欄位
// DateTime: 在 TS 中會被對應為 Date 物件
// @default(now()): 新增資料時，若未傳入值，自動取系統當下時間
// @map("created_at"): 將程式碼中的「createdAt」對應到資料庫內實際的「created_at」欄位名
// ~createdAt DateTime @default(now()) @map("created_at")

// @@map("SKILL"): 將此 Model 對應到資料庫中名為 「SKILL」 的資料表 (預設會是小寫 Skill)
// @@map("SKILL")
// }
```

```jsx
// 這是 Prisma 6/7 推出的 Programmatic Configuration。
// prisma.config
import "dotenv/config"; // 確保在此配置初始化前讀取 .env
import { defineConfig, env } from "@prisma/config"; // Prisma 6+ 提供的配置工具

/**
 * 這是 Prisma 6/7 推出的 Programmatic Configuration (程式化配置)
 * 它允許你用 TypeScript 來定義原本寫在 schema.prisma 裡的 datasource 設定
 */
export default defineConfig({
  datasource: {
    /**
     * 使用 env() 輔助函式讀取環境變數
     * 相比於直接用 process.env.DATABASE_URL，
     * Prisma 的 env() 提供了更好的型別檢查與預設值機制。
     */
    url: env("DATABASE_URL"),
  },
});
```

```jsx
// src/app.js
import { PrismaClient } from '@prisma/client';
// 在開發環境中，為了防止 HMR 導致連線數過多，通常會掛載在 global
const prisma = new PrismaClient();

export default prisma;
```


```jsx
// CRUD 範例 (src/crud.js)
// CRUD 範例 (src/crud.js)
import prisma from './db.js';

async function runCRUD() {
  try {
    // ✅ Create
    const skill = await prisma.skill.create({
      data: { name: 'NodeJS' },
    });
    console.log('Created:', skill);

    // ✅ Read all
    const allSkills = await prisma.skill.findMany();
    console.log('All Skills:', allSkills);

    // ✅ Read one
    const oneSkill = await prisma.skill.findUnique({
      where: { id: skill.id },
    });
    console.log('One Skill:', oneSkill);

    // ✅ Update
    const updatedSkill = await prisma.skill.update({
      where: { id: skill.id },
      data: { name: 'TypeScript' },
    });
    console.log('Updated Skill:', updatedSkill);

    // ✅ Delete
    await prisma.skill.delete({ where: { id: skill.id } });
    const afterDelete = await prisma.skill.findMany();
    console.log('After Delete:', afterDelete);

  } 
  catch (error) {
    console.error('❌ CRUD operation failed:', error);
  } 
  finally {
    // 執行完畢中斷連線
    await prisma.$disconnect();
  }
}

runCRUD();
```
