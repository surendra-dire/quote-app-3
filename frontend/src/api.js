import axios from "axios";

/**
 * IMPORTANT:
 * This must match your Spring Boot base URL
 */
//const BASE_URL = "http://localhost:8080/api";
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

/* ===================== AUTH ===================== */

export const loginUser = async (username, password) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    username,
    password,
  });
  return response.data;
};

export const registerUser = async (user) => {
  const response = await axios.post(`${BASE_URL}/auth/register`, user);
  return response.data;
};

/* ===================== QUOTES ===================== */

export const getQuotes = async (userId) => {
  const response = await axios.get(`${BASE_URL}/quotes/${userId}`);
  return response.data;
};

export const addQuote = async (userId, quote) => {
  const response = await axios.post(
    `${BASE_URL}/quotes/${userId}`,
    quote
  );
  return response.data;
};

export const updateQuote = async (quoteId, quote) => {
  const response = await axios.put(
    `${BASE_URL}/quotes/${quoteId}`,
    quote
  );
  return response.data;
};

export const deleteQuote = async (quoteId) => {
  await axios.delete(`${BASE_URL}/quotes/${quoteId}`);
};
