import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { FaTrash, FaEdit, FaPlus, FaSave } from "react-icons/fa";

const TestQuestionForm = ({ questions, updateQuestion, addQuestion, deleteQuestion, questionTypes }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editData, setEditData] = useState(null);
    const [errors, setErrors] = useState({});
    let previousLength = useRef();
    const openEditModal = (idx) => {
        setEditData({ ...questions[idx] });
        setEditingIndex(idx);
        setErrors({});
    };

    const closeModal = (action = 'delete') => {
        if (action != 'delete' && !validate()) return;
        setEditingIndex(null);
        setEditData(null);
        setErrors({});
    };

    const validate = () => {
        const newErrors = {};
        if (!editData.question) newErrors.question = "Question is required";
        if (!editData.score) newErrors.score = "Score is required";
        if (!editData.questionTypeId) {
            newErrors.questionTypeId = "Question type is required";
        } else {
            const selectedType = questionTypes.find(t => t.id === editData.questionTypeId);
            if (selectedType && !selectedType.score_manually && selectedType.allow_options) {
                const options = editData.options || [];
                if (options.length < 2) {
                    newErrors.options = "At least 2 options are required";
                }
                if (!options.some(opt => opt.isCorrect)) {
                    newErrors.correct = "At least one correct option must be selected";
                }
            } else if (!selectedType.allow_options && !selectedType.score_manually) {
                const options = editData.options || [];
                if (!options.some(opt => opt.isCorrect)) {
                    newErrors.correct = "At least one correct option must be selected";
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveChanges = () => {
        if (!validate()) return;
        if (editingIndex !== null) {
            updateQuestion(editingIndex, 'question', editData.question);
            updateQuestion(editingIndex, 'score', parseInt(editData.score));
            updateQuestion(editingIndex, 'negativeMarks', parseInt(editData.negativeMarks));
            updateQuestion(editingIndex, 'questionTypeId', parseInt(editData.questionTypeId));
            updateQuestion(editingIndex, 'options', editData.options || []);
        }
        closeModal();
    };

    useEffect(() => {
        if (questions.length > previousLength.current) {
            openEditModal(questions.length - 1);
        }
        previousLength.current = questions.length;
    }, [questions.length]);

    const handleOptionChange = (index, field, value) => {
        const selectedType = questionTypes.find(t => t.id === editData.questionTypeId);
        const multipleCorrect = selectedType?.allow_multiple_correct_answer;

        const updatedOptions = [...(editData.options || [])];

        if (field === 'isCorrect') {
            if (multipleCorrect) {
                updatedOptions[index] = { ...updatedOptions[index], isCorrect: value };
            } else {
                updatedOptions.forEach((opt, i) => {
                    updatedOptions[i] = { ...opt, isCorrect: i === index };
                });
            }
        } else {
            updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        }

        setEditData({ ...editData, options: updatedOptions });
    };

    const handleCorrectAnswer = (value) => {
        let options = [{
            isCorrect: true,
            description: value,
            image: null
        }];
        setEditData({ ...editData, options: options });

    }
    const addOption = () => {
        setEditData({
            ...editData,
            options: [...(editData.options || []), { description: '', isCorrect: false, image: '' }]
        });
    };

    const removeOption = (index) => {
        const updatedOptions = [...editData.options];
        updatedOptions.splice(index, 1);
        setEditData({ ...editData, options: updatedOptions });
    };

    return (
        <div>
            {questions.map((q, idx) => {
                const selectedType = questionTypes.find(type => type.id === q.questionTypeId);

                return (
                    <div key={idx} className="border p-3 mb-4 rounded">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Question {idx + 1}:</strong> {q.question}
                                <div className="text-muted">Score: {q.score} | Negative Marks: {q.negativeMarks}</div>
                                <div className="text-muted">Type: {selectedType?.label}</div>
                            </div>
                            <div className="d-flex justify-content-between align-item-center" style={{ width: "30%" }}>
                                <Button variant="outline-primary" onClick={() => openEditModal(idx)}>
                                    <FaEdit title="Edit" />
                                </Button>
                                <Button variant="outline-danger" onClick={() => deleteQuestion(idx)}>
                                    <FaTrash title="Delete Question" />
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="text-center mt-4">
                <Button variant="primary" onClick={addQuestion}><FaPlus /> Add Question</Button>
            </div>

            <Modal show={editingIndex !== null} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Question {editingIndex + 1}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editData && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Question</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editData.question}
                                    onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                                    isInvalid={!!errors.question}
                                />
                                <Form.Control.Feedback type="invalid">{errors.question}</Form.Control.Feedback>
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Score</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            value={editData.score}
                                            onChange={(e) => setEditData({ ...editData, score: e.target.value })}
                                            isInvalid={!!errors.score}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.score}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Negative Marks</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            value={editData.negativeMarks}
                                            onChange={(e) => setEditData({ ...editData, negativeMarks: e.target.value })}
                                            isInvalid={!!errors.negativeMarks}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.negativeMarks}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mt-3">
                                <Form.Label>Question Type</Form.Label>
                                <Form.Select
                                    value={editData.questionTypeId || ''}
                                    onChange={(e) => {
                                        const selectedTypeId = parseInt(e.target.value);
                                        const selectedType = questionTypes.find(type => type.id === selectedTypeId);
                                        setEditData({
                                            ...editData,
                                            questionTypeId: selectedTypeId,
                                            manual_scoring: selectedType?.score_manually ?? false,
                                        });
                                    }} isInvalid={!!errors.questionTypeId}
                                >
                                    <option value="">-- Select Question Type --</option>
                                    {questionTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.questionTypeId}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mt-3 d-flex" style={{ justifyContent: "right" }}>
                                <Form.Check
                                    type="checkbox"
                                    label="Score Manually"
                                    checked={!!editData.manual_scoring}
                                    onChange={(e) =>
                                        setEditData({ ...editData, manual_scoring: e.target.checked })
                                    }
                                    disabled={(() => {
                                        const selectedType = questionTypes.find(
                                            (type) => type.id === editData.questionTypeId
                                        );
                                        return selectedType?.score_manually ?? false;
                                    })()}
                                />
                            </Form.Group>
                            <hr />

                            {(() => {
                                const selectedType = questionTypes.find(t => t.id === editData.questionTypeId);
                                if (!selectedType) return null;

                                if (selectedType.score_manually) {
                                    return (
                                        <div className="alert alert-info mt-3">
                                            This question type does not support options or correct answers.
                                            You will need to score it manually.
                                        </div>
                                    );
                                }

                                if (!selectedType.allow_options) {
                                    return (
                                        <Form.Group className="mt-3">
                                            <Form.Label>Correct Answer</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editData.options?.[0]?.description || ''}
                                                onChange={(e) => handleCorrectAnswer(e.target.value)}
                                                isInvalid={!!errors.correctAnswer}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.correctAnswer}</Form.Control.Feedback>
                                        </Form.Group>
                                    );
                                }

                                return (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center mt-3 mb-1">
                                            <strong>Options</strong>
                                            <Button size="sm" onClick={addOption}><FaPlus /> Add Option</Button>
                                        </div>
                                        {errors.options && <div className="text-danger mb-2">{errors.options}</div>}
                                        {(editData.options || []).map((option, index) => (
                                            <Row key={index} className={`align-items-center mb-2 rounded ${option.isCorrect ? 'border border-success bg-success-subtle' : ''}`}>
                                                <Col>
                                                    <Form.Control
                                                        placeholder="Option description"
                                                        value={option.description}
                                                        onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                                                    />
                                                </Col>
                                                <Col xs="auto">
                                                    <Form.Check
                                                        type={selectedType.allow_multiple_correct_answer ? "checkbox" : "radio"}
                                                        name={`correctOptions-${editingIndex}`}
                                                        className="ms-2"
                                                        checked={option.isCorrect}
                                                        onChange={(e) =>
                                                            handleOptionChange(index, 'isCorrect', !option.isCorrect)
                                                        }
                                                    />
                                                </Col>
                                                <Col xs="auto">
                                                    <Button variant="danger" size="sm" onClick={() => removeOption(index)}><FaTrash /></Button>
                                                </Col>
                                            </Row>
                                        ))}
                                        {errors.correct && <div className="text-danger mb-2">{errors.correct}</div>}

                                    </>
                                );
                            })()}

                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={() => { deleteQuestion(editingIndex); closeModal() }}>
                        <FaTrash title="Delete Question" /> Delete Question
                    </Button>
                    <Button variant="success" onClick={saveChanges}>
                        <FaSave /> Save Question
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TestQuestionForm;
