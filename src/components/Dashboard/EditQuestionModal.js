import React from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

const EditQuestionModal = ({
    editingIndex,
    editData,
    errors,
    questionTypes,
    closeModal,
    deleteQuestion,
    saveChanges,
    handleCorrectAnswer,
    addOption,
    removeOption,
    handleOptionChange,
    setEditData
}) => {
    if (editingIndex === null || !editData) return null;

    const selectedType = questionTypes.find(type => type.id === editData.questionTypeId);
    return (
        <Modal show={editingIndex !== null} onHide={() => closeModal()} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Question {editingIndex + 1}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                        type="text"
                        value={editData.question??""}
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
                                value={editData.negativeMarks??0}
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
                        }}
                        isInvalid={!!errors.questionTypeId}
                    >
                        <option value="">-- Select Question Type --</option>
                        {questionTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.questionTypeId}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mt-3 d-flex justify-content-end">
                    <Form.Check
                        type="checkbox"
                        label="Score Manually"
                        checked={!!editData.manual_scoring}
                        onChange={(e) =>
                            setEditData({ ...editData, manual_scoring: e.target.checked })
                        }
                        disabled={selectedType?.score_manually ?? false}
                    />
                </Form.Group>

                <hr />

                {selectedType && selectedType.score_manually ? (
                    <div className="alert alert-info mt-3">
                        This question type does not support options or correct answers.
                        You will need to score it manually.
                    </div>
                ) : !selectedType?.allow_options ? (
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
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mt-3 mb-1">
                            <strong>Options</strong>
                            <Button size="sm" onClick={addOption}><FaPlus /> Add Option</Button>
                        </div>
                        {errors.options && <div className="text-danger mb-2">{errors.options}</div>}
                        {(editData.options || []).map((option, index) => (
                            <Row key={index} className={`align-items-center mb-2 rounded ${(option.isCorrect || option.is_correct) ? 'border border-success bg-success-subtle' : ''}`}>
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
                                        checked={(option.isCorrect || option.is_correct)}
                                        onChange={() =>
                                            handleOptionChange(index, 'isCorrect', !(option.isCorrect || option.is_correct))
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
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={() => { deleteQuestion(editingIndex); closeModal(); }}>
                    <FaTrash title="Delete Question" /> Delete Question
                </Button>
                <Button variant="success" onClick={saveChanges}>
                    <FaSave /> Save Question
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditQuestionModal;
