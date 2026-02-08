import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { db } from '@/lib/db'
import type {
  Character,
  CharacterStatus,
  SpellInfo,
  RelationInfo,
} from '@/types/character'

interface AIStateUpdatePayload {
  status?: Partial<CharacterStatus>
  inventory_events?: Array<{ op: 'add' | 'remove'; item: string }>
  spells?: Record<string, SpellInfo>
  relationships?: Record<string, RelationInfo>
  world_log_add?: string
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function safeJSONParse<T>(
  jsonStr: string,
  fallbackValue?: T
): T | undefined {
  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error(e)
    try {
      let repaired = jsonStr
      repaired = repaired.replace(
        /([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g,
        '$1"$3":'
      )
      repaired = repaired.replace(/'/g, '"')
      return JSON.parse(repaired)
    } catch (fixError) {
      console.error(`'JSON Repair failed.Error:${fixError} Raw:${jsonStr}'`)
      return fallbackValue
    }
  }
}
export const parseAndUpdateState = async (
  characterId: number,
  aiContent: string
) => {
  const match = aiContent.match(/<state_update>([\s\S]*?)<\/state_update>/)
  if (!match) {
    return
  }
  try {
    const jsonStr = match[1].trim()
    const updates = safeJSONParse<AIStateUpdatePayload>(jsonStr)

    const character = await db.characters.get(characterId)
    if (!character) {
      console.error('找不到角色:', characterId)
      return
    }
    if (!updates) {
      return
    }

    const updatesToApply: Partial<Character> = {
      updated_at: Date.now(),
    }

    // 更新status
    if (updates.status) {
      updatesToApply.status = {
        ...character.status,
        ...updates.status,
      }
    }
    // 更新背包
    if (updates.inventory_events && Array.isArray(updates.inventory_events)) {
      const newInventory = [...(character.inventory || [])]

      updates.inventory_events.forEach((event) => {
        if (event.op === 'add') {
          newInventory.push(event.item)
        } else if (event.op === 'remove') {
          const idx = newInventory.indexOf(event.item)
          if (idx > -1) newInventory.splice(idx, 1)
        }
      })
      updatesToApply.inventory = newInventory
    }
    // 更新咒语
    if (updates.spells) {
      updatesToApply.spells = {
        ...(character.spells || {}),
        ...updates.spells,
      }
    }

    // 更新关系
    if (updates.relationships) {
      updatesToApply.relationships = {
        ...(character.relationships || {}),
        ...updates.relationships,
      }
    }

    // 更新世界线变动
    if (updates.world_log_add) {
      const newLog = [...(character.world_log || [])]
      newLog.push(updates.world_log_add)
      updatesToApply.world_log = newLog
    }

    await db.characters.update(characterId, updatesToApply)

    console.groupCollapsed('🧙‍♂️ 状态已同步到数据库')
    console.log('Updates:', updates)
    console.log('Applied:', updatesToApply)
  } catch (error) {
    console.error('解析状态更新失败:', error)
  }
}
