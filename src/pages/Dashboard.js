import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import CreateView from "../components/Dashboard/CreateView";
import ParticipantView from "../components/Dashboard/ParticipantView";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, authToken } = useContext(AuthContext);
    const [selectedRole, setSelectedRole] = useState("participant");
    const navigate = useNavigate();

    if (!authToken) {
        navigate('/login', { state: { message: "Please login first to access dashboard", redirectionPath: "/dashboard" } });
    }

    return (
        <Container className="text-center mt-2">
            <Card className="p-2 shadow-sm border-0 rounded">
                <h2 className="fw-bold mb-1">Hi, {user?.name || "User"}!</h2>

                <Row className="g-3">
                    <Col xs={12} md={6}>
                        <Button
                            className={`w-100 btn-lg rounded shadow-sm`}
                            style={{
                                backgroundColor: selectedRole === "participant" ? "#0b5ed7" : "#ffffff",
                                color: selectedRole === "participant" ? "#ffffff" : "#0b5ed7",
                                borderColor: "#0b5ed7"
                            }}
                            onClick={() => setSelectedRole("participant")}
                        >
                            You As Test Participant
                        </Button>
                    </Col>
                    <Col xs={12} md={6}>
                        <Button
                            className={`w-100 btn-lg rounded shadow-sm`}
                            style={{
                                backgroundColor: selectedRole === "creator" ? "#0b5ed7" : "#ffffff",
                                color: selectedRole === "creator" ? "#ffffff" : "#0b5ed7",
                                borderColor: "#0b5ed7"
                            }}
                            onClick={() => setSelectedRole("creator")}
                        >
                            You As Test Creator
                        </Button>
                    </Col>
                </Row>
            </Card>

            <div className="mt-4">
                {selectedRole === "participant" ? <ParticipantView /> : <CreateView />}
            </div>
        </Container>
    );
};

export default Dashboard;
