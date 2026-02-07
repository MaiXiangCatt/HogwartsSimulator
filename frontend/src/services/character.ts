import request from '@/lib/request'
import type {
  CharacterListResponse,
  CraeteCharacterParams,
  CreateCharacterResponse,
} from '@/types/character'

export const getCharacterList = () => {
  return request.get<CharacterListResponse>('/character')
}

export const createCharacter = (params: CraeteCharacterParams) => {
  return request.post<CreateCharacterResponse>('/character', params)
}

export const deleteCharacter = (id: number) => {
  return request.delete<void>(`/character/${id}`)
}
