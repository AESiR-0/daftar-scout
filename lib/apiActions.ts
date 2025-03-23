import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';
const founer_id = 2

// Founder Endpoints
export const getScouts = async () => {
  const response = await axios.get(`${BASE_URL}/scouts`)
  return response.data
}

export const getCount = async () => {
  const response = await axios.get(`${BASE_URL}/counts`)
  return response.data
}

export const getFounderProfile = async (founderId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/profile/${founderId}`);
  return response.data;
};

export const getFounderPitches = async (founderId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/${founderId}/pitches`);
  return response.data;
};

export const getFounderQuestions = async (founderId: number, pitchId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/${founderId}/pitches/${pitchId}/questions`);
  return response.data;
};

export const getUnansweredQuestions = async (founderId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/${founderId}/questions/unanswered`);
  return response.data;
};

export const postFounderDocument = async (founderId: number, pitchId: number, documentData: any) => {
  const response = await axios.post(`${BASE_URL}/founder/${founderId}/pitches/${pitchId}/documents`, documentData);
  return response.data;
};

export const getFounderDocuments = async (founderId: number, pitchId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/${founderId}/pitches/${pitchId}/documents`);
  return response.data;
};

export const inviteTeamMember = async (founderId: number, inviteData: any) => {
  const response = await axios.post(`${BASE_URL}/founder/${founderId}/team/invite`, inviteData);
  return response.data;
};

export const getFounderOffers = async (founderId: number, pitchId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/${founderId}/pitches/${pitchId}/offers`);
  return response.data;
};

export const postOfferAction = async (offerId: number, actionData: any) => {
  const response = await axios.post(`${BASE_URL}/founder/offers/${offerId}/action`, actionData);
  return response.data;
};

export const getFounderBills = async (founderId: number, pitchId: number) => {
  const response = await axios.get(`${BASE_URL}/founder/${founderId}/pitches/${pitchId}/bills`);
  return response.data;
};

// Investor Endpoints
export const getInvestorProfile = async (investorId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/investor/profile/${investorId}`);
  return response.data;
};

export const getDaftarProfile = async (daftarId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/daftar/profile/${daftarId}`);
  return response.data;
};

export const getDaftarInvestors = async (daftarId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/daftars/${daftarId}/investors`);
  return response.data;
};

export const postDaftarInvestor = async (daftarId: number, investorData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/daftars/${daftarId}/investors`, investorData);
  return response.data;
};

export const inviteDaftarInvestor = async (daftarId: number, inviteData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/daftars/${daftarId}/invite`, inviteData);
  return response.data;
};

export const getSampleQuestions = async (scoutId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/scouts/${scoutId}/sample-questions`);
  return response.data;
};

export const postCustomQuestion = async (scoutId: number, questionData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/scouts/${scoutId}/custom-questions`, questionData);
  return response.data;
};

export const getCustomQuestions = async (scoutId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/scouts/${scoutId}/custom-questions`);
  return response.data;
};

export const postInvestorDocument = async (pitchId: number, documentData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/pitches/${pitchId}/documents`, documentData);
  return response.data;
};

export const getInvestorDocuments = async (pitchId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/pitches/${pitchId}/documents`);
  return response.data;
};

export const postInvestorOffer = async (pitchId: number, offerData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/pitches/${pitchId}/offers`, offerData);
  return response.data;
};

export const getInvestorOffers = async (pitchId: number) => {
  const response = await axios.get(`${BASE_URL}/investor/pitches/${pitchId}/offers`);
  return response.data;
};

export const postInvestorOfferAction = async (offerId: number, actionData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/offers/${offerId}/action`, actionData);
  return response.data;
};

export const postInvestorBill = async (pitchId: number, billData: any) => {
  const response = await axios.post(`${BASE_URL}/investor/pitches/${pitchId}/bills`, billData);
  return response.data;
}; 