import axios from "axios";
import { $token } from "../stores/auth.js";
import { API_URL } from "./service.js";

/**
 * Retrieves all categories through a fetch. This only reads a page of 30 tags,
 * it doesn't read everything. There aren't that many anyway.
 */
export async function getCategories() {
  const res = await fetch(API_URL + "/categories?page=1&per_page=30");

  if (res.status != 200) return null;
  return await res.json();
}

export const getAllCategories = async () => {
  try {
    const res = await axios.get(API_URL + "/categories?all=true");
    if (res.status !== 200) return null;

    return { status: 200, categories: res.data };
  } catch (err) {
    return null;
  }
};

export const createCategory = async (name) => {
  try {
    const token = $token.get();
    const res = await axios.post(API_URL + "/categories", {name}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    return { status: 200, category: res.data };
  } catch (err) {
    return err
  }
}

export const editCategory = async (data) => {
  try {
    const token = $token.get();
    const res = await axios.put(API_URL + `/categories/${data.id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 200) return null;

    return { status: 200, categories: res.data };
  } catch (err) {
    return err;
  }
};

export const deleteCategory = async (id) => {
  try {
    const token = $token.get();
    const res = await axios.delete(API_URL + `/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 200) return null;

    return { status: 200, categories: res.data };
  } catch (err) {
    return err;
  }
};
