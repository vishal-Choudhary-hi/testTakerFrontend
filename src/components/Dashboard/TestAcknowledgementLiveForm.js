import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import Loading from "../Loading";

const TestAcknowledgementLiveForm = ({ handleNext }) => {
    const [loading, setLoading] = useState(false);

    const handleMakeLive = async () => {
        setLoading(true);
        await handleNext();
        setLoading(false);
    };

    return (
        <Card className="p-4 shadow-sm rounded-4 mt-3">
            <h4 className="mb-3 text-primary">Finalize & Launch Your Test</h4>
            <p className="text-muted">
                Please ensure all test details, participant emails, and questions have been finalized.
                Once the test is made <strong>Live</strong>, emails will be sent to all invited participants with their login details.
            </p>
            <ul className="text-muted">
                <li>All questions and test settings will be locked after this.</li>
                <li>Participants will be able to access the test based on the start time.</li>
                <li>Make sure you have reviewed everything before proceeding.</li>
            </ul>

            <div className="d-flex justify-content-end">
                <Button variant="success" disabled={loading} onClick={handleMakeLive}>
                    {loading ? <Loading message="Making Test Live" type='primaryButton' /> : null}
                    Make Test Live
                </Button>
            </div>
        </Card>
    );
};

export default TestAcknowledgementLiveForm;
