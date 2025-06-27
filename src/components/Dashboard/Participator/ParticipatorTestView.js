import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiCall from "../../../services/api";
import Loading from "../../Loading";
import { Card, Button, Badge, Row, Col, Modal } from "react-bootstrap";
import { useSnackbar } from "../../../contexts/SnackbarContext";
import VerifyPhoto from "./VerifyPhoto";
import ShowParticipantQuestionSection from "./ShowParticipantQuestionSection";
import ChatView from "../../Chats/ChatView";
import { AuthContext } from "../../../contexts/AuthContext";

const ParticipatorTestView = () => {
    const [totalTestWarnings,setTotalTestWarnings] = useState(0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [testData, setTestData] = useState(null);
    const [accepting, setAccepting] = useState(false);
    const [startTest, setStartTest] = useState(false);
    const [testId, setTestId] = useState(null);
    const [faceValidate, setFaceValidate] = useState(false);
    const { showSnackbar } = useSnackbar();
    const isMounted = useRef(false);
    const [warnings, setWarnings] = useState(null);
    const [warning, setWarning] = useState({ buttonLabel: "", showModal: false, text: "", buttonAction: "" });
    const [completeTest, setCompleteTest] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // in seconds
    const [showChatModal, setShowChatModal] = useState(false);
    const { user, authToken } = useContext(AuthContext);
    const [pause,setPause]=useState(true);
    const [canNotUpdateWarnings,setCanNotUpdateWarnings]=useState(false);
    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;
        const testIdParam = searchParams.get("testId");
        setTestId(testIdParam);
        if (testIdParam) {
            setLoading(true);
            getTestDetailsApiCall(testIdParam);
        }
    }, []);
    useEffect(() => {
        if (warning.showModal) {
            updateWarningData(warning.text);
            setWarnings(warnings + 1);
        }
    }, [warning])

    useEffect(() => {
        if (testData?.Test.duration_in_seconds) {
            setTimeLeft(testData.Test.duration_in_seconds);
        }
    }, [testData]);

    useEffect(() => {
        if(pause){
            return;
        }
        if (timeLeft === null) return;
    
        if (timeLeft === 0) {
            handleQuitTest("Time Up");
            return;
        }
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    
        return () => clearInterval(timer);
    }, [timeLeft,pause]);
    
    const updateWarningData=(warningMessage)=>{
        apiCall('post', `dashboard/participant/saveTestParticipantWarnings`,{testId: testId, warningMessage: warningMessage}, null, true);
    }
    
    const getTestDetailsApiCall = async (testId) => {
        const res = await apiCall("GET", `dashboard/participant/getTestBasicDetails?testId=${testId}`, null, showSnackbar, true);
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!res.data) {
            navigate("/dashboard");
            return;
        }
        setTestData(res.data);
        setTotalTestWarnings(res.data.Test.total_warnings_allowed?.warnings || 50);
        setLoading(false);
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date)) return "Invalid Date";
        return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    };

    const now = new Date();
    const Test = testData?.Test || {};
    // const hasParticipated = testData?.TestParticipant?.participated;
    const hasParticipated = false;
    const isLiveNow =
        Test.status === "live" &&
        new Date(Test.start_time) <= now &&
        new Date(Test.end_time) >= now;

    const getButtonLabel = () => {
        if (!testData?.accepted) return "Accept Invitation";
        if (hasParticipated) return "Test Already Completed";
        if (Test.status !== "live") return "Test Not Live";
        if (new Date(Test.start_time) > now) return "Test Not Started Yet";
        if (new Date(Test.end_time) < now) return "Test Ended";
        return "Start Test";
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case "live": return "success";
            case "draft": return "warning";
            case "completed": return "secondary";
            default: return "dark";
        }
    };

    const handleAcceptInvitation = async () => {
        setAccepting(true);
        const res = await apiCall("POST", `dashboard/participant/acceptInvitation`, {
            testId: searchParams.get("testId"),
        }, showSnackbar, true);
        if (res.status === 200) {
            setTestData({
                ...testData,
                accepted: true,
            });
            getTestDetailsApiCall(searchParams.get("testId"), false);
        }
        setAccepting(false);
    };

    const handleButtonClick = async () => {
        if (!testData.accepted) {
            handleAcceptInvitation();
        } else if (isLiveNow && !hasParticipated) {
            const res=await apiCall("POST", `dashboard/participant/startTest`, {
                testId: searchParams.get("testId"),
            }, showSnackbar, true);
            if (res.status === 200) {
                const prevTestParticipant = testData.TestParticipant;
                setTestData({
                    ...testData,
                    TestParticipant: {
                        ...prevTestParticipant,
                        participated: true,
                    },
                });
            }
            await requestFullscreen();
            setStartTest(true);
            setPause(false);
        }
    };

    const getButtonState = () => {
        if (!testData?.accepted) return !accepting;
        if (hasParticipated) return false;
        return isLiveNow;
    };

    const faceValidation = (faveValidation) => {
        if (faveValidation) {
            setFaceValidate(true);
        }
    };

    // Enforce Fullscreen
    const requestFullscreen = () => {
        if(startTest && faceValidate) {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    };

    const detectExitFullscreen = () => {
        if(startTest && faceValidate) {
            document.addEventListener("fullscreenchange", () => {
                if (!document.fullscreenElement && !canNotUpdateWarnings) {
                    setWarning({
                        modalVariant: "warning",
                        text: "You have exited Full-Screen Mode. For security, fairness and prevention from cheating Full-Screen Mode is required for the test.",
                        buttonAction: "enable_full_screen_mode",
                        buttonLabel: "Enter Full-Screen Mode",
                        showModal: true
                    })
                }
            });
        }
    };
    const handleWarningAction = () => {
        if (warnings > totalTestWarnings) {
            handleQuitTest("Total Warnings Exceeded");
        } else {
            if (warning.buttonAction == 'enable_full_screen_mode') {
                requestFullscreen();
            } else if (warning.buttonAction == 'tab_switch') {
                requestFullscreen();
            } else {

            }
        }
        handleWarning();
    }
    const handleQuitTest = async (warning) => {
        setCompleteTest(true);
        setStartTest(false);
        setFaceValidate(false);
    }
    const handleWarning = () => {
        setWarning({
            buttonAction: "",
            text: "",
            showModal: false,
            buttonLabel: ""
        });
    }
    // Prevent tab switch and reload
    const preventTabSwitch = () => {
        if (startTest && faceValidate) {
            let enabledFullScreenMode = false
            window.addEventListener("fullscreenchange", () => {
                enabledFullScreenMode = true
            });
            if (enabledFullScreenMode) {
                return;
            }

            window.addEventListener("blur", () => {
                if(!canNotUpdateWarnings){
                    setWarning({
                        modalVariant: "warning",
                        text: "You have tried to switch the tab or reload. For security, fairness and prevention from cheating switching tabs or reloading is not allowed for the test.",
                        buttonAction: "tab_switch",
                        buttonLabel: "Ok Will Keep In Mind",
                        showModal: true
                    })
                }
            });
            window.addEventListener("beforeunload", (e) => {
                if(!canNotUpdateWarnings){
                    setWarning({
                        modalVariant: "warning",
                        text: "You have tried to switch the tab or reload. For security, fairness and prevention from cheating switching tabs or reloading is not allowed for the test.",
                        buttonAction: "tab_switch",
                        buttonLabel: "Ok Will Keep In Mind",
                        showModal: true
                    })
                    e.preventDefault();
                    e.returnValue = "";
                }
            });
        }
    };

    const handleAllTimeFaceVerification=(faceVerified)=>{
        if(faceVerified){
            return;
        }
        setWarning({
            modalVariant: "warning",
            text: "Not Able to detect you in front of your screen, Please stay in front during whole test duration.",
            buttonAction: "tab_switch",
            buttonLabel: "Ok Will Keep In Mind",
            showModal: true
        })
    }

    // Disable copy/paste
    const preventCopyPaste = () => {
        document.addEventListener("copy", (e) => e.preventDefault());
        document.addEventListener("paste", (e) => e.preventDefault());
        document.addEventListener("cut", (e) => e.preventDefault());
        document.addEventListener("contextmenu", (e) => e.preventDefault());
    };
    const disableTextSelection = () => {
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        document.body.style.msUserSelect = "none";
        document.body.style.MozUserSelect = "none";
    };
    // Apply restrictions and periodic face detection
    useEffect(() => {
        if (startTest && faceValidate) {
            detectExitFullscreen();
            preventTabSwitch();
            disableTextSelection();
            preventCopyPaste();
        }else{
        }
    }, [startTest,faceValidate]);

    return (
        <div className="container py-5">
            <div className="position-relative mb-4">
  <div className="d-flex justify-content-between align-items-center flex-wrap">
    {/* Chat Button */}
    {
        !loading &&
    <Button
      variant="success"
      className="rounded-pill px-4 py-2 fs-6"
      onClick={() => setShowChatModal(true)}
    >
      Chat with Instructor
    </Button>
    }

    {/* Test Title */}
    <div className="flex-grow-1 text-center">
      <h2 className="fw-bold text-primary m-0">{Test.test_name}</h2>
      <div className="text-muted fs-6">DSA Interview Prep</div>
    </div>

    {/* Timer */}
    {timeLeft !== null && (
      <div className="text-end text-danger">
        <div className="fs-6">⏳ Time Remaining</div>
        <div className="fs-4 fw-bold">
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
          {String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
    )}
  </div>

  {/* Chat Modal */}
  {showChatModal && (
    <ChatView
      fromUserId={user.id}
      toUserId={Test.created_by}
      showModal={showChatModal}
      toUserName={Test.CreatedByUser.name}
      onModalClose={() => setShowChatModal(false)}
      testId={testId}
    />
  )}

  {/* Webcam Face Verification in bottom-right corner */}
  {startTest && faceValidate && (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "220px",
        height: "160px",
        zIndex: 999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <VerifyPhoto
        testId={testId}
        onValidate={handleAllTimeFaceVerification}
        showOnlyFaceCam={true}
        verifyFaceOnRegularIntervals={true}
        customStyle={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </div>
  )}
</div>

            {loading ? (
                <Loading message="Fetching Test Details..." />
            ) : (
                <Card className="shadow p-4 border-0 rounded-4 bg-white">
                    {(completeTest) ? (
                    <Card
                        bg="success"
                        text="white"
                        className="text-center p-4 rounded-4"
                        style={{ fontWeight: "600", fontSize: "1.3rem" }}
                    >
                        <Card.Body>
                        <Card.Title>
                            ✅ Test Completed Successfully
                        </Card.Title>
                        <Card.Text className="mt-3">
                            You will get your result via email whenever your test instructor releases the results.
                        </Card.Text>
                        </Card.Body>
                    </Card>
                    )                    
                    :<>
                    {startTest ?
                        <>
                            {faceValidate ? <>
                                <ShowParticipantQuestionSection testId={testId} handleQuitTest={handleQuitTest}/>
                            </>:
                                <VerifyPhoto testId={testId} onValidate={faceValidation}/>
                            }
                        </> :
                        <>
                            <Row>
                                <Col md={8}>
                                    <p className="text-muted">{Test.description || "No description provided."}</p>
                                </Col>
                                <Col md={4} className="text-md-end">
                                    <Badge bg={getStatusVariant(Test.status)} className="fs-6 px-3 py-2 text-uppercase">
                                        {Test.status || "Unknown"}
                                    </Badge>
                                </Col>
                            </Row>

                            <hr />

                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Duration:</strong><br />
                                    {Math.floor(Test.duration_in_seconds / 60)} mins {Test.duration_in_seconds % 60} secs
                                </Col>
                                <Col md={4}>
                                    <strong>Start Time:</strong><br />
                                    {formatDate(Test.start_time)}
                                </Col>
                                <Col md={4}>
                                    <strong>End Time:</strong><br />
                                    {formatDate(Test.end_time)}
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <strong>Invitation Note:</strong><br />
                                    {Test.invite_email_additional_content || "No additional note provided."}
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <strong>Study Material:</strong><br />
                                    {Test.study_material || "No study material shared."}
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <strong>Instructions:</strong>
                                    {Test.TestInstructions?.length ? (
                                        <ul className="mt-2">
                                            {Test.TestInstructions.map((ins, idx) => (
                                                <li key={idx}>
                                                    <strong>{ins.heading}</strong>: {ins.description}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted mt-2">No instructions available.</p>
                                    )}
                                </Col>
                            </Row>

                            <hr />

                            <h5 className="mb-3 text-secondary">Participant Information</h5>

                            <Row className="mb-2">
                                <Col md={6}>
                                    <strong>Name:</strong><br />
                                    {testData.name || "Name not provided."}
                                </Col>
                                <Col md={6}>
                                    <strong>Email Status:</strong><br />
                                    {testData.email_status ? "Email Sent" : "Email Not Sent"}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col md={6}>
                                    <strong>Invitation Accepted:</strong><br />
                                    {testData.accepted ? "Yes" : "No"}
                                </Col>
                                <Col md={6}>
                                    <strong>Additional Details:</strong><br />
                                    {testData.additional_details || "No details provided."}
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <strong>Participated:</strong><br />
                                    {hasParticipated ? "Yes" : "No"}
                                </Col>
                            </Row>

                            <div className="text-center">
                                <Button
                                    variant={
                                        !testData.accepted
                                            ? "success"
                                            : hasParticipated
                                                ? "secondary"
                                                : "primary"
                                    }
                                    className="px-5 py-2 rounded-pill fs-5"
                                    disabled={!getButtonState()}
                                    onClick={handleButtonClick}
                                >
                                    {accepting ? "Accepting..." : getButtonLabel()}
                                </Button>
                            </div>
                        </>
                    }
                    </>
                }
                </Card>
            )}
            {
                warning.showModal &&
                <Modal show={warning.showModal} backdrop="static" keyboard={false} centered>
                    <Modal.Header className={(warning.modalVariant === "error" || warnings > totalTestWarnings) ? "bg-danger text-white" : "bg-warning text-dark"}>
                        <Modal.Title>
                            {(warning.modalVariant === "error" || warnings > totalTestWarnings) ? "❌ Error Occurred" : "⚠️ Attention Required"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {warnings > totalTestWarnings ? "You got disqualified from test in the attempt to cheat. Your Scoring will be done on the basis of your responses till now." : warning.text}
                        {(warning.modalVariant !== "error" && warnings <= totalTestWarnings) && (
                            <div className="mt-3">
                                <b>Only {totalTestWarnings - warnings} warnings left before disqualification.</b>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant={(warning.modalVariant === "error" || warnings > totalTestWarnings) ? "danger" : "warning"}
                            onClick={handleWarningAction}
                        >
                            {warnings > totalTestWarnings ? "Exit Test" : warning.buttonLabel}
                        </Button>
                    </Modal.Footer>
                </Modal>
            }

        </div>
    );
};

export default ParticipatorTestView;

