import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://192.168.1.3:5050"; // ← YOUR LAN IP

export const apiFetch = async (url, method = "GET", body) => {
  try {
    const token = await AsyncStorage.getItem("access_token");

    const res = await axios({
      url: `${API_BASE}${url}`,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return res.data;
  } catch (err) {
    if (err.response) {
      return {
        error:
          err.response.data?.error ||
          err.response.data?.message ||
          "Request failed",
      };
    }
    return { error: err.message || "Network error" };
  }
};

export const getMyRole = async () => {
  return apiFetch("/auth/me/role");
};



