export interface CharacterStatus {
  hp: number
  mp: number
  max_mp: number
  gold: number
  ap: number
  max_ap: number

  // 五维属性
  knowledge: number
  athletics: number
  charm: number
  morality: number
  mental: number

  // 时间与位置信息
  current_year: number
  current_month: number
  current_week: number
  current_weekday: number
  location: string
  game_mode: string
}

export interface SpellInfo {
  level: number
  desc: string
}

export interface RelationInfo {
  level: number
  tag: string
  desc: string
}

export interface InventoryItemInfo {
  desc: string
}

export interface Character {
  id?: number // 自增主键
  name: string
  gender: string
  house: string
  blood_status: string
  wand: string
  patronus: string

  // --- 核心存档数据 ---
  summary: string // AI 的剧情长文本记忆 (最重要)
  persona?: string // 角色的人设，包括性格、缺点和动机等。

  // --- 结构化数据 (UI 渲染用) ---
  status: CharacterStatus
  inventory: Record<string, InventoryItemInfo> // 物品列表
  spells: Record<string, SpellInfo> // 技能表
  relationships: Record<string, RelationInfo> // 关系表
  world_log: string[] // 世界线变动 Tags

  updated_at: number // 时间戳
}

// 保留原有的 API 响应接口，或者根据新架构调整。
// 如果不再使用后端API创建角色，这些可能暂时不需要，或者需要调整为本地使用。
// 暂时保留但注释掉旧的，或者根据需要保留 CreateParams
export interface CraeteCharacterParams {
  name: string
  gender: string
  blood_status: string
  wand: string
  patronus: string
}
