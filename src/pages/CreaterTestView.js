import React, { useEffect, useState, useRef, use, useContext } from "react";
import apiCall from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import { Container, Accordion, Button, Row, Col, Card, ListGroup, Badge, CardBody } from "react-bootstrap";
import InviteDetailsAndScoreManually from "../components/InviteDetailsAndScoreManually";
import { useSnackbar } from "../contexts/SnackbarContext";
import ChatView from "../components/Chats/ChatView";    
import { AuthContext } from "../contexts/AuthContext";

const CreaterTestView = () => {
    const isMounted=useRef(false);
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [testData, setTestData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const questionRefs = useRef({});
    const [loadingMessage, setLoadingMessage] = useState("Fetching Test Details");
    const [showInviteDetails, setShowInviteDetails] = useState(null);
    const [testButtonDetails, setTestButtonDetails] = useState({label:"", disabled: true});
    const [warningMessages,setWarningMessages]=useState([]);
    const [startChatWithUser,setStartChatWithUser] = useState(null);
    const { user, authToken } = useContext(AuthContext);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;
        let testId = searchParams.get("testId");
        if (testId) {
            setLoading(true);
            setLoadingMessage("Fetching Test Details");
            getTestDetailsApiCall(testId);
        }
    }, []);
    useEffect(() => {
        if(testData === null) return;
        if (testData.status === "result_pending") {
            setTestButtonDetails({label:"Release Test Results", disabled: false});
        }else if(testData.status === "live") {
            setTestButtonDetails({label:"Mark Test As Result Pending", disabled: false});
        }else{
            setTestButtonDetails({label:"", disabled: true});
        }
    }, [testData]);
    const getTestDetailsApiCall = async (testId, showLoading = true) => {
        if (showLoading) setLoading(true);
            setLoadingMessage("Fetching Test Details");
        let res = await apiCall("GET", `dashboard/creater/getTest?testId=${testId}&role=creator`, null, null, true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!res.data) navigate("/dashboard");
        setTestData(res.data);
        setLoading(false);
    };

    const scrollToQuestion = (sectionIndex, questionIndex) => {
        const id = `question-${sectionIndex}-${questionIndex}`;
        const el = questionRefs.current[id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        setCurrentQuestion({ sectionIndex, questionIndex });
    };

    const navigateQuestion = (direction) => {
        if (!currentQuestion) return;
        const { sectionIndex, questionIndex } = currentQuestion;
        const section = testData.QuestionSection[sectionIndex];

        if (direction === "next") {
            if (questionIndex < section.Question.length - 1) {
                scrollToQuestion(sectionIndex, questionIndex + 1);
            } else if (sectionIndex < testData.QuestionSection.length - 1) {
                scrollToQuestion(sectionIndex + 1, 0);
            }
        } else {
            if (questionIndex > 0) {
                scrollToQuestion(sectionIndex, questionIndex - 1);
            } else if (sectionIndex > 0) {
                const prevSection = testData.QuestionSection[sectionIndex - 1];
                scrollToQuestion(sectionIndex - 1, prevSection.Question.length - 1);
            }
        }
    };

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        return date.toLocaleString();
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} min ${secs} sec`;
    };

    const getParticipantTotalScore = (selectedOptions) => {

        let totalScore=0;
        selectedOptions.forEach(option => {
            if (option.manual_score) {
                totalScore += option.manual_score;
            }else{
                totalScore += option.score;
            }
        });
        return totalScore;
    }
    const getParticipantTotalNegativeScore = (selectedOptions) => {

        let totalScore=0;
        selectedOptions.forEach(option => {
            if (option.manual_score && option.manual_score < 0) {
                totalScore += option.manual_score;
            }else if (option.score < 0) {
                totalScore += option.score;
            }
        });
        return totalScore;
    }
    const getParticipantTotalPositiveScore = (selectedOptions) => {

        let totalScore=0;
        selectedOptions.forEach(option => {
            if (option.manual_score && option.manual_score > 0) {
                totalScore += option.manual_score;
            }else if (option.score > 0) {
                totalScore += option.score;
            }
        });
        return totalScore;
    }
    const handleTestDetailsCta = async() => {
        if (testData.status === "result_pending") {
            setTestButtonDetails({label:"Release Test Results", disabled: false});
            await releaseTestResult();
        }else if(testData.status === "live") {
            let data = {};
            setTestButtonDetails({label:"Mark Test As Result Pending", disabled: false});
            data.status = 'result_pending';
            data.testId = parseInt(testData.id);
            await apiCall("POST", "dashboard/creater/changeTestStatus", data, showSnackbar, true);
        }
        getTestDetailsApiCall(testData.id, false);

    }
    const releaseTestResult = async () => {
        setLoading(true);
            setLoadingMessage("Releasing Test Results");
        const response = await apiCall("POST", "dashboard/creater/releaseTestResult", { testId: testData.id }, showSnackbar, true);
        setLoading(false);

    }

    const testParticipantWarnings= async(invite) => {
        setLoading(true);
        setLoadingMessage("Fetching Test Participant Warnings");
        const response = await apiCall("GET", `dashboard/creater/testParticipantWarnings?inviteId=${invite.id}`, null, showSnackbar, true);
        setLoading(false);
        setWarningMessages(response.data);
    }

    if (loading) return <Loading message= {loadingMessage}  showType="non_closeable_popup" />;

    return (
        <Container className="py-4">
            <h3 className="mb-4">Test Overview</h3>
            {console.log(startChatWithUser)}
            {startChatWithUser && <ChatView fromUserId={user.id} toUserId={startChatWithUser.InviteUser.id} showModal={true} toUserName={startChatWithUser.name} role='creator' onModalClose={()=>setStartChatWithUser(null)} testId={searchParams.get("testId")}/>}
            <Accordion defaultActiveKey="0">
                {/* Test Details Section */}
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Test Details</Accordion.Header>
                    <Accordion.Body>
                        <ListGroup>
                            <ListGroup.Item><strong>Test Name:</strong> {testData.test_name}</ListGroup.Item>
                            <ListGroup.Item><strong>Description:</strong> {testData.description}</ListGroup.Item>
                            <ListGroup.Item><strong>Start Time:</strong> {formatDateTime(testData.start_time)}</ListGroup.Item>
                            <ListGroup.Item><strong>End Time:</strong> {formatDateTime(testData.end_time)}</ListGroup.Item>
                            <ListGroup.Item><strong>Duration:</strong> {formatDuration(testData.duration_in_seconds)}</ListGroup.Item>
                            <ListGroup.Item><strong>Total Warnings Allowed:</strong> {testData.total_warning_allowed}</ListGroup.Item>
                            <ListGroup.Item><strong>Status:</strong> {testData.status}</ListGroup.Item>
                        </ListGroup>
                        {!testButtonDetails.disabled &&
                        <Button variant="primary" className="mt-3" onClick={() => handleTestDetailsCta()} disabled={testButtonDetails.disabled}>{testButtonDetails.label}</Button>
            }
                    </Accordion.Body>
                </Accordion.Item>

                {testData.TestInstructions && testData.TestInstructions.length > 0 && (
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Test Instructions</Accordion.Header>
                        <Accordion.Body>
                            <Card>
                                <CardBody>
                                    {testData.TestInstructions.map((instruction, index) => (
                                        <div key={index} className="mb-3">
                                            <h5>{instruction.heading}</h5>
                                            <p>{instruction.description}</p>
                                        </div>
                                    ))}
                                </CardBody>
                            </Card>
                        </Accordion.Body>
                    </Accordion.Item>
                )}

                {/* Test Invitations Section */}
                <Accordion.Item eventKey="3">
                    <Accordion.Header>Test Invitations</Accordion.Header>
                    <Accordion.Body>
                        <Row>
                            {testData.TestInvitations?.map((invite, index) => (
                                <Col md={4} key={index} className="mb-3">
                                    <Card>
                                        <Card.Body>
                                            <div className="d-flex align-items-center">
                                                <Card.Img
                                                    variant="top"
                                                    src={invite.VerificationImage.link}
                                                    alt={invite.name}
                                                    style={{ height: "50px", width: "50px", borderRadius: "50%" }}
                                                />
                                                <div className="ms-3">
                                                    <Card.Title>{invite.name}</Card.Title>
                                                    <Card.Text>{invite.email}</Card.Text>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <Badge bg={invite.email_status ? "success" : "secondary"} className="me-2">
                                                    {invite.email_status ? "Email Sent" : "Not Sent"}
                                                </Badge>
                                                <Badge bg={invite.accepted ? "success" : "warning"} className="me-2">
                                                    {invite.accepted ? "Accepted" : "Not Accepted"}
                                                </Badge>
                                                <Badge bg={invite.TestParticipant?.participated ? "success" : "danger"} className="me-2">
                                                    {invite.TestParticipant?.participated ? "Participated" : "Not Participated"}
                                                </Badge>
                                                <Badge bg={invite.TestParticipant?._count?.TestParticipantWarnings ? "danger" : "success"}>
                                                    {invite.TestParticipant?._count?.TestParticipantWarnings?? 0+ " Warnings" }
                                                </Badge>
                                            </div>
                                            <div className="mt-4 p-3 border rounded bg-light">
                                                {!invite.TestParticipant?.participated ? 
                                                <>
                                                    <h6>No Test Score Summary (not participated in test yet)</h6>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                         <Button variant="success" className="mt-3" onClick={()=>setStartChatWithUser(invite)}>
                                                            Chat With Participant
                                                        </Button>
                                                    </div>
                                                </>
                                                :
                                                    <>
                                                        <h6 className="text-primary mb-3 fw-bold">Test Score Summary</h6>

                                                        <div className="d-flex justify-content-between mb-2">
                                                            <div className="fw-bold text-dark">Score:</div>
                                                            <div className="fw-bold text-success">{getParticipantTotalScore(invite.TestParticipant.SelectedOptionMapping)}</div>
                                                        </div>

                                                        <div className="d-flex justify-content-between mb-2">
                                                            <div className="fw-bold text-dark">Total Positive Marks:</div>
                                                            <div className="fw-bold text-primary">{getParticipantTotalPositiveScore(invite.TestParticipant.SelectedOptionMapping)}</div>
                                                        </div>

                                                        <div className="d-flex justify-content-between">
                                                            <div className="fw-bold text-dark">Total Negative Marks:</div>
                                                            <div className="fw-bold text-danger">{getParticipantTotalNegativeScore(invite.TestParticipant.SelectedOptionMapping)}</div>
                                                        </div>
                                                        <div className="d-flex justify-content-between ">
                                                            <Button variant="primary" className="mt-3 me-2" onClick={()=>setShowInviteDetails(invite)}>
                                                                View Details And Score Manually
                                                            </Button>
                                                            <Button variant="danger" className="mt-3" onClick={()=>testParticipantWarnings(invite)}>
                                                                View All Warnings
                                                            </Button>
                                                        </div>
                                                        <div className="d-flex justify-content-center align-items-center">
                                                             <Button variant="success" className="mt-3" onClick={()=>setStartChatWithUser(invite)}>
                                                                Chat With Participant
                                                            </Button>
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>

                {/* Question Sections Section */}
                <Accordion.Item eventKey="4">
                    <Accordion.Header>Question Sections</Accordion.Header>
                    <Accordion.Body>
                        {testData.QuestionSection?.map((section, sectionIndex) => (
                            <Accordion key={sectionIndex} className="mb-4">
                                <Accordion.Item eventKey={`section-${sectionIndex}`}>
                                    <Accordion.Header>{section.label}</Accordion.Header>
                                    <Accordion.Body>
                                        <p>{section.description}</p>
                                        <p>Total Questions: {section.Question.length} | Total Score: {section.Question.reduce((acc, q) => acc + q.score_on_correct_answer, 0)}</p>

                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {section.Question.map((_, qIdx) => (
                                                <Button
                                                    key={qIdx}
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => scrollToQuestion(sectionIndex, qIdx)}
                                                >
                                                    Q{qIdx + 1}
                                                </Button>
                                            ))}
                                        </div>
                                        {
                                            showInviteDetails!=null &&
                                            <InviteDetailsAndScoreManually show={showInviteDetails!=null} onClose={()=>setShowInviteDetails(null)} details={showInviteDetails}/>

                                        }
                                        {section.Question.map((question, questionIndex) => (
                                            <Card key={questionIndex} className="mb-3" ref={(el) => questionRefs.current[`question-${sectionIndex}-${questionIndex}`] = el}>
                                                <Card.Body>
                                                    <h6>Q{questionIndex + 1}: {question.question}</h6>
                                                    <p><strong>Score:</strong> {question.score_on_correct_answer} | <strong>Negative Mark:</strong> {question.negative_score_on_wrong_answer ?? 0}</p>
                                                    <ListGroup>
                                                        {question.Options.map((opt, optIndex) => (
                                                            <ListGroup.Item key={optIndex} variant={opt.is_correct ? "success" : undefined}>
                                                                {opt.description} {opt.is_correct && <Badge bg="success" className="ms-2">Correct</Badge>}
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                </Card.Body>
                                            </Card>
                                        ))}

                                        {currentQuestion?.sectionIndex === sectionIndex && (
                                            <div className="d-flex justify-content-between mt-4">
                                                <Button onClick={() => navigateQuestion("prev")} variant="secondary">Previous</Button>
                                                <Button onClick={() => navigateQuestion("next")} variant="primary">Next</Button>
                                            </div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        ))}
                    </Accordion.Body>
                </Accordion.Item>

                {/* OverAll Performance Analysis*/}
                <Accordion.Item eventKey="5">
                    <Accordion.Header>Overall Performance Analysis</Accordion.Header>
                    <Accordion.Body>
                        <Card className="mb-3">
                            <Card.Body>
                                {/* show total invited */}
                                {/* show total participated */}
                                {/* show total number of sections */}
                                {/* show total number of questions */}
                                {/* show the average marks got  in whole test*/}
                                {/* show the average marks got section wise */}
                                {/* show filter of filtering test invitees to show only who have participated in the test, search with name, search with email*/}
                                {/* show a table of test invitees in table show columns with email, name, participated, number of warnings, number of correct answers,number of incorrect answers, total score, positive marks, negative marks, above average, below average, average,ranking,score manually cta */}
                                {/* show bar graph representations of the score each participant got */}
                                {/* show bar graph representations of the score each participant got in perticular section and for each section*/}
                                {/* show bar graph representations of the negative score each participant got both whole test and section wise*/}
                                {/* show bar graph representations of the positive score each participant got both whole test and section wise*/}
                                {/* show bar graph representations of the questions participant got right and wrong in a pair graph*/}

                            </Card.Body>
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export default CreaterTestView;
