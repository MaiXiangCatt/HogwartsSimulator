import Dexie, { type Table } from 'dexie'
import type { Character } from '@/types/character'
import type { ChatLog } from '@/types/chat'

export class HogwartsDB extends Dexie {
  characters!: Table<Character>
  logs!: Table<ChatLog>

  constructor() {
    super('HogwartsDB')

    // Schema 定义：仅列出索引字段
    // characters: 使用 id 主键，name 和 updated_at 用于列表排序
    // logs: 使用 id 主键，character_id 用于查询某角色的记录
    this.version(1).stores({
      characters: '++id, name, updated_at',
      logs: '++id, character_id, timestamp',
    })
  }
}

export const db = new HogwartsDB()
