import React, { useEffect, useState } from "react";
import { Accordion, Form, Button } from "react-bootstrap";
import { BsFillPatchCheckFill, BsFillPatchQuestionFill } from "react-icons/bs";
import TestQuestionForm from "./TestQuestionForm";
import { FaEdit } from "react-icons/fa";


const TestQuestionSection = ({ section, index, updateSectionField, questionTypes, sectionValidationError }) => {
    const [editingLabel, setEditingLabel] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const updateQuestion = (qIndex, field, value) => {
        const updatedQuestions = [...section.questions];
        updatedQuestions[qIndex][field] = value;

        if (field === 'score') {
            const sectionTotalScore = updatedQuestions.reduce(
                (sum, q) => sum + parseInt(q.score || 0),
                0
            );
            updateSectionField(index, 'totalScore', sectionTotalScore);
        }

        updateSectionField(index, 'questions', updatedQuestions);
    };

    const addQuestion = () => {
        const updatedQuestions = [...section.questions, {
            question: '',
            negativeMarks: 0,
            image: "",
            score: 0,
            questionTypeId: null,
            manual_scoring: false,
            options: [{
                isCorrect: false,
                description: "",
                image: ""
            }],
        }];
        updateSectionField(index, 'questions', updatedQuestions);
    };

    const deleteQuestion = (qIndex) => {
        const updatedQuestions = section.questions.filter((_, i) => i !== qIndex);
        updateSectionField(index, 'questions', updatedQuestions);
    };

    return (
        <div key={index} className="border p-3 mb-3 rounded">

            {/* LABEL */}
            <h5 style={{ textAlign: "center" }}>Section {index + 1}</h5>
            <div className="mb-2 d-flex align-items-center justify-content-between">
                {editingLabel ? (
                    <Form.Control
                        autoFocus
                        type="text"
                        value={section.label}
                        onChange={(e) => updateSectionField(index, 'label', e.target.value)}
                        onBlur={() => setEditingLabel(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingLabel(false)}
                    />
                ) : (
                    <div className="d-flex align-items-center w-100 justify-content-between">
                        <strong>{section.label || "Untitled Section"}</strong>
                        <Button variant="outline-primary" onClick={() => setEditingLabel(true)}>
                            <FaEdit title="Edit" />
                        </Button>
                    </div>
                )}
            </div>
            {sectionValidationError && sectionValidationError.label !== '' && <div className="text-danger" style={{ textAlign: "right" }}>{sectionValidationError.label}</div>}

            {/* DESCRIPTION */}
            <div className="d-flex align-items-start justify-content-between">
                {editingDescription ? (
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={section.description}
                        onChange={(e) => updateSectionField(index, 'description', e.target.value)}
                        onBlur={() => setEditingDescription(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingDescription(false)}
                    />
                ) : (
                    <div className="d-flex justify-content-between align-items-start w-100">
                        <span className="text-muted" style={{ whiteSpace: "pre-wrap", flex: 1 }}>
                            {section.description || "No description"}
                        </span>
                        <Button variant="outline-primary" onClick={() => setEditingDescription(true)}>
                            <FaEdit title="Edit" />
                        </Button>
                    </div>
                )}
            </div>
            {sectionValidationError && sectionValidationError.description !== '' && <div className="text-danger" style={{ textAlign: "right" }}>{sectionValidationError.description}</div>}

            {/* Stats Row */}
            <div className="d-flex align-items-center justify-content-between">
                <div><BsFillPatchQuestionFill className="text-danger me-1" /> <strong>Total Questions:</strong> {section.questions.length}</div>
                <div><BsFillPatchCheckFill className="text-primary me-1" /> <strong>Total Score:</strong> {section.totalScore || 0}</div>
            </div>

            {/* Accordion */}
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Manage Questions</Accordion.Header>
                    <Accordion.Body>
                        <TestQuestionForm
                            questions={section.questions}
                            updateQuestion={updateQuestion}
                            addQuestion={addQuestion}
                            deleteQuestion={deleteQuestion}
                            questionTypes={questionTypes}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            {sectionValidationError && sectionValidationError.questions !== '' && <div className="text-danger" style={{ textAlign: "right" }}>{sectionValidationError.questions}</div>}
        </div>
    );
};

export default TestQuestionSection;
