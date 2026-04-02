const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'ORDER',
  columns: {
    // name: {
    //   type: 'varchar', // 字串型別
    //   length: 50, // 最大長度限制 50 個字元
    //   unique: true, // 唯一性約束：資料庫內不允許有兩個重複的 Skill 名稱
    //   nullable: false // 不可以為空值
    // },
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false
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
      type: 'varchar',
      length: 30,
      unique: true,
      nullable: false
    },
    amount: {
      type: 'integer',
      nullable: false
    },
    purchased_credits: {
      type: 'integer',
      nullable: false
    },
    payment_status: {
      type: 'varchar',
      length: 20,
      default: 'unpaid',
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
      type: 'timestamp',
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
        // 設定 Join 欄位
        name: 'credit_package_id', // 本表欄位名稱 (Order 表的 credit_package_id)
        referencedColumnName: 'id', // 對方表主鍵欄位 (CreditPackage 的 id)
        foreignKeyConstraintName: 'order_credit_package_id_fk' // 外鍵名稱
      }
    }
  }
})
