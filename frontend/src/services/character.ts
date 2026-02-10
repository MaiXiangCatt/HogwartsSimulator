// import request from '@/lib/request'
import type {
  // CharacterListResponse,
  CraeteCharacterParams,
  // CreateCharacterResponse,
  Character,
} from '@/types/character'
import { db } from '@/lib/db'

// TODO: Cloud Sync
// export const getCharacterList = () => {
//   return request.get<CharacterListResponse>('/character')
// }

export const getCharacterList = async () => {
  return await db.characters.orderBy('updated_at').reverse().toArray()
}

// TODO: Cloud Sync
// export const createCharacter = (params: CraeteCharacterParams) => {
//   return request.post<CreateCharacterResponse>('/character', params)
// }

export const createCharacter = async (data: CraeteCharacterParams) => {

  const newChar: Character = {
    name: data.name,
    gender: data.gender,
    house: '',
    blood_status: data.blood_status,
    wand: data.wand,
    patronus: data.patronus,
    
    // 初始化默认值
    status: {
      hp: 100,
      mp: 0,
      max_mp: 0,
      gold: 0,
      ap: 7,
      max_ap: 7,
      knowledge: 0,
      athletics: 0,
      charm: 0,
      morality: 0,
      mental: 0,
      current_year: 1991,
      current_month: 7,
      current_week: 4,
      current_weekday: 1,
      location: '',
      game_mode: 'weekly',
    },
    inventory: {},
    spells: {},
    relationships: {},
    world_log: [],
    summary: '',
    persona: '',
    updated_at: Date.now(),
  }
  console.log('newChar', newChar)
  return await db.characters.add(newChar)
}

export const getCharacter = async (id: number) => {
  return await db.characters.get(id)
}

// TODO: Cloud Sync
// export const deleteCharacter = (id: number) => {
//   return request.delete<void>(`/character/${id}`)
// }

export const deleteCharacter = async (id: number) => {
  await db.transaction('rw', db.characters, db.logs, async () => {
    await db.characters.delete(id)
    await db.logs.where({ character_id: id }).delete()
  })
}
