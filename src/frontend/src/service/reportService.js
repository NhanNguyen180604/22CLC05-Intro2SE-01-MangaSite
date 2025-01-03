import axios from "axios";
import { $token } from "../stores/auth.js";
import { API_URL, getErrorMessage } from "./service.js";
const API = API_URL + "/reports";

export const sendReport = async (reportField, reportedId, description) => {
  const token = localStorage.getItem("token");
  if (!token)
    return {
      status: 401,
      message: "You are not logged in",
    };

  try {
    const response = await axios.post(
      API,
      {
        [reportField]: reportedId,
        description: description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { status: response.status, report: response.data };
  } catch (error) {
    return getErrorMessage(error);
  }
};

/**
 * Retrieves a list of reports.
 * @param {{ page: number, showProcessed: boolean }} data
 * @returns {Promise<{ reports: any[], more: boolean } | null>} Results can be null if unauthorized, or an object containing data.
 */
export async function getReports({ page = 1, showProcessed = false }) {
  const token = $token.get();
  const res = await fetch(
    `${API_URL}/reports?page=${page}&show_processed=${showProcessed}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
    },
  );

  if (res.status != 200) return null;
  const data = await res.json();
  return { reports: data.reports, more: data.page < data.total_pages };
}

/**
 * Process a report, returns the new report.
 * @param {{ _id: string }} data
 */
export async function processReport({ _id }) {
  const token = $token.get();
  const res = await fetch(`${API_URL}/reports/${_id}`, {
    method: "PUT",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status != 200) return null;
  return await res.json();
}

/**
 * Delete a report.
 * @param {{ _id: string }} data
 */
export async function deleteReport({ _id }) {
  const token = $token.get();
  const res = await fetch(`${API_URL}/reports/${_id}`, {
    method: "DELETE",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status != 200) return false;
  return true;
}
