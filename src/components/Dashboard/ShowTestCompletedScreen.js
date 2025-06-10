import React from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

const ShowTestCompletedScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    let testId = searchParams.get("testId");
    const handleViewTestDetails = () => {
        navigate(`/dashboard/test?testId=${testId}`);
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="text-center p-5 shadow-lg border-0 rounded-4" style={{ maxWidth: "500px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
                <h3 className="mb-3 text-success">Test is Live!</h3>
                <p className="text-muted mb-4">
                    Congratulations! Your test has been successfully made live.
                    All participants have been notified via email and can now access the test.
                </p>
                <Button variant="primary" size="lg" onClick={handleViewTestDetails}>
                    View Live Test Details
                </Button>
            </Card>
        </div>
    );
};

export default ShowTestCompletedScreen;
