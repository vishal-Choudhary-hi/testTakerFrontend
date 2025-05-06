import axios from "axios";

const baseUrl = "http://localhost:4000";

const apiCall = async (method, endpoint, data = {}, showSnackbar, authRequired = true) => {
    try {
        let headers = {
            // "Content-Type": "application/json"
        };
        let authorizationToken = localStorage.getItem("authorization");
        if (authorizationToken) {
            headers = {
                ...headers,
                "authorization": authorizationToken
            }
        }
        const response = await axios({
            method,
            url: `${baseUrl}/${endpoint}`,
            data,
            headers: headers,
        });
        let message = response.data.message ?? "Request successful";
        let type = response.status >= 200 && response.status < 300 ? "success" : "error";
        if (showSnackbar) {
            showSnackbar(message, type);
        }
        return {
            data: response.data.data,
            status: response.status,
        };
    } catch (error) {
        let errorMessage = error.response?.data?.message || "Something went wrong";
        if (showSnackbar) {
            showSnackbar(errorMessage, 'error');
        }
        return {
            data: null,
            status: 'false',
            error: errorMessage
        };
    }
};

export default apiCall;
