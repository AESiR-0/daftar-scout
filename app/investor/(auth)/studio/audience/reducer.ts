import type { AudienceDetails } from "./types"

export const initialState: AudienceDetails = {
  location: "",
  community: "",
  gender: "",
  ageMin: "",
  ageMax: "",
  stage: "",
  sector: "",
}

export function audienceReducer(
  state: AudienceDetails, 
  action: { type: string; payload: any }
) {
  return { ...state, [action.type]: action.payload }
} 