import React, { useEffect, useRef, useState, useContext } from "react";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import apiCall from "../services/api";
import OTPInput from "../components/OTPInput";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "../contexts/SnackbarContext";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
    const { showSnackbar } = useSnackbar();
    const { login } = useContext(AuthContext);
    const location = useLocation();
    const [redirectionData, setRedirectionData] = useState({ redirectionPath: null, message: null });
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [takeOtp, setTakeOtp] = useState(false);
    const [userId, setUserId] = useState(null);
    const emailRef = useRef(null);

    useEffect(() => {
        setRedirectionData({
            'redirectionPath': location.state?.redirectionPath,
            'message': location.state?.message
        })
    }, [location, setRedirectionData])
    useEffect(() => {
        if (!takeOtp && emailRef.current) {
            emailRef.current.focus();
        }
    }, [takeOtp]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.trim()) {
            setError("Email is required.");
            return;
        }
        if (!email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }
        if (isRegister && !name.trim()) {
            setError("Name is required for registration.");
            return;
        }

        setLoading(true);
        try {
            const endpoint = isRegister ? "registerNewUser" : "getUserWithEmail"
            const requestData = isRegister ? { name, email } : { email };
            const response = await apiCall("POST", endpoint, requestData, showSnackbar);

            if (response?.status === 200) {
                setUserId(response.data.userId);
                setTakeOtp(true);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };
    const handleOtpSubmit = async (otp) => {
        setError("");
        try {
            otp = Number(otp)
            const endpoint = "verifyUserLoginOTP"
            const requestData = { userId, otp };
            setLoading(true);
            const response = await apiCall("POST", endpoint, requestData, showSnackbar);

            if (response?.status === 200) {
                const token = response.data.token;
                login(token);
                if (redirectionData.redirectionPath) {
                    setTimeout(() => navigate(redirectionData.redirectionPath), 500);
                } else {
                    setTimeout(() => navigate("/dashboard"), 500);
                }
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }

    };
    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
            <Card className="p-4 shadow-lg text-center" style={{ width: "400px", borderRadius: "15px" }}>
                <Card.Body>
                    <Card.Title className="mb-3 text-primary" style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
                        {isRegister ? "Register" : "Login"}
                    </Card.Title>
                    {redirectionData.message ?
                        <p className="text-muted">{redirectionData.message}</p>
                        : <p className="text-muted">Access your account or create a new one</p>
                    }

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                ref={emailRef}
                                required
                                disabled={takeOtp}
                            />
                        </Form.Group>
                        {isRegister && (
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    disabled={takeOtp}
                                />
                            </Form.Group>
                        )}
                        {takeOtp === false &&
                            <Button variant="success" type="submit" className="w-100" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : "Get OTP"}
                            </Button>
                        }
                        {takeOtp &&
                            <OTPInput length={6} onSubmit={handleOtpSubmit} loading={loading} />
                        }
                    </Form>

                    <div className="mt-3">
                        {!takeOtp &&
                            <Button variant="link" className="text-primary" onClick={() => setIsRegister(!isRegister)}>
                                {isRegister ? "Already have an account? Login" : "New here? Register"}
                            </Button>
                        }
                        {takeOtp &&
                            <Button variant="link" className="text-primary" onClick={() => setTakeOtp(false)}>
                                Enter Email Again
                            </Button>
                        }
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Login;
