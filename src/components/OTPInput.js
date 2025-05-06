import React, { useState, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";
import "../style/OtpInput.css";
const OTPInput = ({ length = 6, onSubmit, loading }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!loading) {
            setOtp(new Array(length).fill(""));
        }
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [loading, length]);
    // Handle OTP input change
    const handleChange = (index, value) => {
        if (isNaN(value)) return; // Allow only numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // If OTP is complete, trigger submit
        if (newOtp.join("").length === length) {
            onSubmit(newOtp.join(""));
        }
    };

    // Handle backspace to move back
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <Form className="d-flex justify-content-center">
            {otp.map((value, index) => (
                <Form.Control
                    disabled={loading}
                    key={index}
                    type="text"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="otp-box mx-2 text-center"
                    style={{
                        width: "40px",
                        height: "40px",
                        fontSize: "1.5rem",
                        textAlign: "center",
                        marginBottom: "15px",
                        borderRadius: "5px",
                        border: "1px solid #ccc"
                    }}
                />
            ))}
        </Form>
    );
};

export default OTPInput;
