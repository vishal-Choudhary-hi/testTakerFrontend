import React, { useEffect, useState, useRef } from "react";
import apiCall from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import { Container, Accordion, Button, Row, Col, Card, ListGroup, Badge, CardBody } from "react-bootstrap";

const CreaterTestView = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [testData, setTestData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const questionRefs = useRef({});

    useEffect(() => {
        let testId = searchParams.get("testId");
        if (testId) {
            setLoading(true);
            getTestDetailsApiCall(testId);
        }
    }, []);

    const getTestDetailsApiCall = async (testId, showLoading = true) => {
        if (showLoading) setLoading(true);
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

    if (loading) return <Loading message="Fetching Already Available Details" />;

    return (
        <Container className="py-4">
            <h3 className="mb-4">Test Overview</h3>

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
                            <ListGroup.Item><strong>Status:</strong> {testData.status}</ListGroup.Item>
                        </ListGroup>
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
                                            <div className="d-flex">
                                                <Card.Img
                                                    variant="top"
                                                    src={invite.VerificationImage.link}
                                                    alt={invite.name}
                                                    style={{ height: "50px", width: "50px", borderRadius: "50%" }}
                                                />
                                                <div style={{ marginLeft: "10px" }}>
                                                    <Card.Title>{invite.name}</Card.Title>
                                                    <Card.Text>{invite.email}</Card.Text>
                                                </div>
                                            </div>
                                            <Badge bg={invite.email_status ? "success" : "secondary"}>
                                                {invite.email_status ? "Email Sent" : "Not Sent"}
                                            </Badge>
                                            {/* Display the acceptance status */}
                                            <Badge bg={invite.accepted ? "success" : "warning"} className="ms-2">
                                                {invite.accepted ? "Accepted" : "Not Accepted"}
                                            </Badge>
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
            </Accordion>
        </Container>
    );
};

export default CreaterTestView;
