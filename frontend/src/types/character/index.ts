export interface CharacterStatus {
  hp: number
  mp: number
  max_mp: number
  gold: number
  ap: number
  max_ap: number
  knowledge: number
  athletics: number
  charm: number
  morality: number
  mental: number
  current_year: number
  current_month: number
  current_week: number
  current_weekday: number
  game_mode: string
}

export interface Character {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  user_id: number
  name: string
  gender: string
  house: string
  blood_status: string
  wand: string
  patronus: string
  status: CharacterStatus
}

export interface CharacterListResponse {
  characterList: Character[]
}

export interface CraeteCharacterParams {
  name: string
  gender: string
  blood_status: string
  wand: string
  patronus: string
}

export interface CreateCharacterResponse {
  character_id: number
}
