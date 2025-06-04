import React, { useEffect, useState } from "react";
import apiCall from "../../../services/api";
import Loading from "../../Loading";
import { Button, Card, Alert } from "react-bootstrap";
import StartTestSection from "./StartTestSection";

const ShowParticipantQuestionSection = ({ testId,handleQuitTest }) => {
    const [questionSection, setQuestionSection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState(null);
    const [completedSections, setCompletedSections] = useState([]);
    useEffect(() => {
        getTestQuestionSection();
    }, []);

    const getTestQuestionSection = async () => {
        const res = await apiCall(
            "get",
            `dashboard/participant/getTestQuestionSections?testId=${testId}`,
            null,
            null,
            true
        );
        const questionSections = res.data.questionSections;
        setQuestionSection(questionSections);
        setLoading(false);
    };

    const onStartSection = async (sectionId) => {
        setCurrentSection(sectionId);
    }

    const markSectionComplete =  (sectionId) => {
        setCompletedSections([...completedSections, sectionId]);
        setCurrentSection(null);
    }

    const globalInstructions = (
        <Alert variant="info">
            <h5>Online Test Instructions</h5>
            <ul>
                <li>You <strong>cannot copy or paste</strong> during the test.</li>
                <li>You <strong>cannot switch tabs</strong> or leave the test window.</li>
                <li>You <strong>must stay in full-screen mode</strong>.</li>
                <li>Ensure <strong>stable internet connectivity</strong>.</li>
                <li>Questions are <strong>not skippable</strong>.</li>
                <li>Once submitted, you <strong>cannot revisit a question</strong>.</li>
                <li>
                    Some questions have <strong>negative marking</strong> for wrong answers.
                </li>
                <li>
                    In multiple correct answer questions, selecting even one extra or missing one
                    correct option will mark the answer as <strong>incorrect</strong>.
                </li>
            </ul>
        </Alert>
    );

    return (
        <>
            {loading ? (
                <Loading message="Fetching Test Details..." />
            ) : (
                <div>
                    {!currentSection && globalInstructions}
                    {questionSection.map((section, index) => {
                        const numQuestions = section.Question.length;
                        const hasNegativeMarking = section.Question.some(
                            (q) => q.negative_score_on_wrong_answer > 0
                        );

                        return (
                            <>
                            {
                            currentSection ? 
                            <StartTestSection testId={testId} sectionId={currentSection} onMarkSectionCompleted={markSectionComplete}/>
                            :
                            <Card
                                key={index}
                                style={{
                                    marginBottom: "20px",
                                    border: "1px solid #dee2e6",
                                    borderRadius: "10px",
                                }}
                            >
                                <Card.Body>
                                    <Card.Title>
                                        Section {section.sequence}: {section.label}
                                    </Card.Title>
                                    <Card.Text>
                                        <strong>Description:</strong> {section.description}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Total Score:</strong> {section.total_score}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Number of Questions:</strong> {numQuestions}
                                    </Card.Text>
                                    {hasNegativeMarking && (
                                        <Card.Text style={{ color: "red", fontWeight: "bold" }}>
                                            ⚠️ This section contains questions with negative marking.
                                        </Card.Text>
                                    )}
                                    <Button
                                        variant={completedSections.some((completedSection) => completedSection === section.id)?"success":"primary"}
                                        onClick={() => onStartSection(section.id)}
                                        disabled={completedSections.some((completedSection) => completedSection === section.id)}
                                    >
                                        {completedSections.some((completedSection) => completedSection === section.id)?"Completed":"Get Started"}                                 </Button>
                                </Card.Body>
                            </Card>
                            }
                            </> 
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ShowParticipantQuestionSection;
