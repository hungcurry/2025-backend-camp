const { EntitySchema } = require('typeorm')

// ~ 01.typeORM  寫法
// entities/Skill.js

module.exports = new EntitySchema({
  name: 'Skill',
  tableName: 'SKILL',
  columns: {
    id: {
      primary: true, // 設定為主鍵 (Primary Key)，每筆資料唯一的身份證
      type: 'uuid', // 資料型別使用 UUID（長得像 550e8400-e29b-...）
      generated: 'uuid', // 告訴資料庫：新增資料時，請自動幫我生成 UUID
      nullable: false // 不可以為空值
    },
    name: {
      type: 'varchar', // 字串型別
      length: 50, // 最大長度限制 50 個字元
      unique: true, // 唯一性約束：資料庫內不允許有兩個重複的 Skill 名稱
      nullable: false // 不可以為空值
    },
    createdAt: {
      type: 'timestamp', // 時間戳記型別
      createDate: true, // 【自動化關鍵】這行告訴 TypeORM：當資料「第一次存入」時，自動填入現在時間
      name: 'created_at', // 對應到資料庫欄位名為 created_at (通常資料庫偏好底線命名)
      nullable: false // 不可以為空值
    }
  }
})

// ~ 01.prisma 寫法
// schema.prisma

// model Skill {
//   id        String   @id @default(uuid()) @db.Uuid
//   name      String   @unique @db.VarChar(50)
//   createdAt DateTime @default(now()) @map("created_at")
//   @@map("SKILL") // 對應資料庫表名
// }

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
