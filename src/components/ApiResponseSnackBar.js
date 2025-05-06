import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const ApiResponseSnackBar = ({ open, message, severity, handleClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position at top-right
        >
            <MuiAlert
                onClose={handleClose}
                severity={severity} // "success" | "error" | "warning" | "info"
                sx={{ width: "100%" }}
            >
                {message}
            </MuiAlert>
        </Snackbar>
    );
};

export default ApiResponseSnackBar;
