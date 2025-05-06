import React, { useEffect, useRef, useState } from "react";
import StepProgressBar from "../components/StepProgressBar";
import { Button, Card } from "react-bootstrap";
import CreateTestDetails from "../components/Dashboard/CreateTestDetails";
import apiCall from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import TestParticipantsForm from "../components/Dashboard/TestParticipantsForm";
import TestQuestionSectionForm from "../components/Dashboard/TestQuestionSectionForm";
import TestAcknowledgementLiveForm from "../components/Dashboard/TestAcknowledgementLiveForm";
import ShowTestCompletedScreen from "../components/Dashboard/ShowTestCompletedScreen";

const CreateTest = ({ }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const { showSnackbar } = useSnackbar();
    const totalSteps = 4;
    const [currentStep, setCurrentStep] = useState(1);
    const [showCompletedScreen, setShowCompletedScreen] = useState(false);
    const [prefilledData, setPrefilledData] = useState(null);
    const isMounted = useRef(false);
    useEffect(() => {
        if (isMounted.current) return
        isMounted.current = true;
        let testId = searchParams.get("testId");
        if (testId) {
            setLoading(true);
            getTestDetailsApiCall(testId);
        }
    }, []);
    const getTestDetailsApiCall = async (testId, showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        let res = await apiCall("GET", `dashboard/creater/getTest?testId=${testId}`, null, null, true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPrefilledData(res.data);
        if (!res.data) {
            navigate("/dashboard");
        }
        setLoading(false);
    }
    const handleNext = async (requestObj) => {
        let response = null
        let testId = searchParams.get("testId");
        if (currentStep === 1) {
            if (testId) {
                requestObj.testId = testId;
            }
            response = await apiCall('POST', 'dashboard/creater/createNewTest', requestObj, showSnackbar, true)
        } else if (currentStep === 2) {
            if (!testId) {
                showSnackbar("Please Create a test first", "info");
                navigate('/dashboard/createTest');
            } else {
                let data = {};
                data.testInvitations = requestObj;
                data.testId = parseInt(testId);
                response = await apiCall('POST', 'dashboard/creater/inviteParticipants', data, showSnackbar, true)
            }
        } else if (currentStep === 3) {
            if (!testId) {
                showSnackbar("Please Create a test first", "info");
                navigate('/dashboard/createTest');
            } else {
                let data = {};
                data.questionSections = [...requestObj.sections];
                data.testId = parseInt(testId);
                response = await apiCall('POST', 'dashboard/creater/updateTestQuestion', data, showSnackbar, true)
            }
        } else if (currentStep === 4) {
            if (!testId) {
                showSnackbar("Please Create a test first", "info");
                navigate('/dashboard/createTest');
            } else {
                let data = {};
                data.status = 'live';
                data.testId = parseInt(testId);
                response = await apiCall("POST", "dashboard/creater/changeTestStatus", data, showSnackbar, true);
            }
        }
        if (response?.status === 200) {
            if (testId) {
                await getTestDetailsApiCall(testId, false)
            }
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            } else
                setShowCompletedScreen(true)
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <Card className="shadow-sm p-4 pt-2 pb-2 rounded-3 mt-4 justify-content-center" style={{ backgroundColor: "#f8f9fa", borderRadius: "12px", maxWidth: "80%", margin: "auto" }}>
            {showCompletedScreen ?
                <ShowTestCompletedScreen /> :
                <>
                    <div className="d-flex justify-content-center">
                        <StepProgressBar totalSteps={totalSteps} currentStep={currentStep} />
                    </div>
                    <div className="mt-3 mb-2">
                        <Card className="p-4 shadow-sm rounded-3" style={{ maxWidth: "70%", margin: "auto", backgroundColor: "white" }}>
                            {currentStep === 1 && loading === false && <CreateTestDetails handleNext={handleNext} prefilledData={prefilledData} />}
                            {currentStep === 2 && loading === false && <TestParticipantsForm handleNext={handleNext} prefilledData={prefilledData} />}
                            {currentStep === 3 && loading === false && <TestQuestionSectionForm handleNext={handleNext} prefilledData={prefilledData} />}
                            {currentStep === 4 && loading === false && <TestAcknowledgementLiveForm handleNext={handleNext} />}
                        </Card>
                        {loading && <Loading message="Fetching Already Available Details" />}
                    </div>
                    {/* Card Wrapper */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <Button onClick={handlePrevious} disabled={currentStep === 1}>⬅️ Previous</Button>
                        {/* <Button onClick={handleNext} disabled={currentStep === totalSteps}>Next ➡️</Button> */}
                    </div>
                </>
            }
        </Card>
    );
};

export default CreateTest;
