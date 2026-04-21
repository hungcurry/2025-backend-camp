const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Order', // Entity 名稱
  tableName: 'ORDER', // 對應資料表名稱
  columns: {
    id: {
      primary: true, // 主鍵 (每筆資料唯一)
      type: 'uuid', // UUID 型別
      generated: 'uuid', // 新增資料時自動生成 UUID
      nullable: false // 不可為空值
    },
    user_id: {
      type: 'uuid',
      nullable: false
    },
    credit_package_id: {
      type: 'uuid',
      nullable: false
    },
    merchant_order_no: {
      type: 'varchar', // 字串型別
      length: 30, // 最大長度 50
      unique: true, // 唯一性約束
      nullable: false
    },
    amount: {
      type: 'integer', // 整數型別
      nullable: false
    },
    purchased_credits: {
      type: 'integer',
      nullable: false
    },
    payment_status: {
      type: 'varchar',
      length: 20,
      default: 'unpaid', // 未付款
      nullable: false
    },
    newebpay_trade_no: {
      type: 'varchar',
      length: 30,
      nullable: true
    },
    payment_type: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    paid_at: {
      type: 'timestamp', // 時間戳記
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
      nullable: false
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

// *columns常用20屬性
/**
  columns: {
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
  */

// *relations 如何看
/**
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
*/
