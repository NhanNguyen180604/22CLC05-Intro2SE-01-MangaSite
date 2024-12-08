import axios from "axios";
import { API_URL, getErrorMessage } from "./service.js";
const API = API_URL + '/reports';

export const sendReport = async (reportField, reportedId, description) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    try {
        const response = await axios.post(API,
            {
                [reportField]: reportedId,
                description: description,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return { status: response.status, report: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};