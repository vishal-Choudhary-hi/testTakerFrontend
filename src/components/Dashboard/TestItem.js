import React, { useEffect, useState } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Function to get Bootstrap variant based on status
const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
        case "draft":
            return "warning";
        case "live":
            return "danger";
        case "completed":
            return "success";
        case "result_pending":
            return "info";
        default:
            return "secondary";
    }
};

const TestCard = ({ testDetails, role }) => {
    const navigate = useNavigate();
    const [buttonDetails, setButtonDetails] = useState({
        label: "",
        disabled: true
    });
    useEffect(() => {
        const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

        const startTime = new Date(testDetails.start_time);
        const endTime = new Date(testDetails.end_time);
        const now = new Date();

        console.log("Start Time:", formatDateTime(startTime));
        console.log("End Time:", formatDateTime(endTime));
        console.log("Current Time:", formatDateTime(now));

        if (role === 'creator') {
            setButtonDetails({ label: "Manage Test", disabled: false });
        } else {
            if (testDetails.status === "live" && startTime <= now && endTime >= now) {
                setButtonDetails({ label: "Give Test", disabled: false });
            } else if (endTime <= now) {
                setButtonDetails({ label: "Test Ended", disabled: true });
            } else {
                setButtonDetails({ label: "Test Not Started", disabled: true });
            }
        }
    }, []);

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        return date.toLocaleString();
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} min ${secs} sec`;
    };

    return (
        <Card className="mb-4 shadow border-0 rounded-4 bg-light position-relative px-3 pt-4 pb-3">
            {/* Status Badge - Top Right Half Outside */}
            <Badge
                bg={getStatusVariant(testDetails.status)}
                className="position-absolute top-0 end-0 translate-middle-y me-2"
                style={{ transform: "translate(50%, -50%)", borderRadius: "8px", padding: "6px 12px", zIndex: 1 }}
            >
                {testDetails.status}
            </Badge>

            <Card.Body className="p-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                    {/* Left Info */}
                    <div>
                        <h5 className="fw-bold text-primary mb-2">{testDetails.test_name}</h5>
                        <div className="text-muted mb-2 small">{testDetails.description || "No description provided."}</div>
                        <div className="d-flex flex-wrap text-dark small gap-3">
                            <span><strong>Duration:</strong> {formatDuration(testDetails.duration_in_seconds)}</span>
                            <span><strong>Start:</strong> {formatDateTime(testDetails.start_time)}</span>
                            <span><strong>End:</strong> {formatDateTime(testDetails.end_time)}</span>
                        </div>
                    </div>

                    {/* Right Button */}
                    <div className="text-md-end mt-3 mt-md-0">
                        <Button
                            variant="outline-primary"
                            className="rounded-pill px-4"
                            disabled={buttonDetails.disabled}
                            onClick={() =>
                                navigate(

                                    role === 'creator'
                                        ? (testDetails.status === "draft" ? `/dashboard/createTest?testId=${testDetails.id}` : `/dashboard/test?testId=${testDetails.id}`)
                                        : `/participator/test?testId=${testDetails.id}`
                                )
                            }
                        >
                            {buttonDetails.label}
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default TestCard;
