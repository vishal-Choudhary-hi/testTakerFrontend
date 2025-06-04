import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import apiCall from "../services/api";
import { useSearchParams } from "react-router-dom";

const InviteDetailsAndScoreManually = ({ show, onClose, details }) => {
  const mounter = useRef(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [participantData, setParticipantData] = useState([]);
  const [activeQuestionForScoreEdit, setActiveQuestionForScoreEdit] = useState(null);
  const [manualScoreInput, setManualScoreInput] = useState("");

  useEffect(() => {
    if (mounter.current) return;
    mounter.current = true;
    fetchParticipantData();
  }, []);

  const fetchParticipantData = async () => {
    const testId = searchParams.get("testId");
    setLoading(true);
    const response = await apiCall(
      "GET",
      `dashboard/creater/getTestParticipantQuestion?testId=${testId}&participantId=${details.id}`,
      null,
      null,
      true
    );
    setParticipantData(response.data);
    setLoading(false);
  };

  const getScore = (q) => {
    if (q.manual_score !== null) return `${q.manual_score>=0?'+':''}${q.manual_score} (Manual)`;
    if (q.skipped) return "Skipped (0)";
    return q.is_correct
      ? `+${q.Question.score_on_correct_answer}`
      : `-${q.Question.negative_score_on_wrong_answer}`;
  };

  const handleChangeScore = async (e) => {
    e.preventDefault();
    const testId = searchParams.get("testId");
    if (!manualScoreInput || isNaN(manualScoreInput)) return;

    const response = await apiCall(
      "POST",
      `dashboard/creater/changeScoreManually`,
      {
        manualScore: parseFloat(manualScoreInput),
        questionId: activeQuestionForScoreEdit?.question_id,
        testId: testId,
        participantId: details.id,
      },
      null,
      true
    );

    if (response.status === 200) {
      setActiveQuestionForScoreEdit(null);
      setManualScoreInput("");
      fetchParticipantData();
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{details.name} - Answer Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <div>
              {participantData.length === 0 && <p>No data available.</p>}
              {participantData.map((q, idx) => (
                <div key={q.question_id} className="mb-4 p-3 border rounded bg-light">
                  <h5>
                    Q{idx + 1}. {q.Question.question}
                  </h5>
                  <ul>
                    {q.Question.Options.map((opt) => {
                      const isSelected = q.option_ids.includes(opt.id);
                      const isCorrect = opt.is_correct;

                      return (
                        <li
                          key={opt.id}
                          style={{
                            color: isCorrect
                              ? "green"
                              : isSelected
                              ? "red"
                              : "black",
                            fontWeight: isSelected ? "bold" : "normal",
                          }}
                        >
                          {opt.description}
                          {isCorrect && " ✅"}
                          {isSelected && !isCorrect && " ❌"}
                        </li>
                      );
                    })}
                    {q.input_value && <li><strong>Answer:</strong> {q.input_value}</li>}
                  </ul>
                  <p>
                    <strong>Score:</strong> {getScore(q)}
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setActiveQuestionForScoreEdit(q);
                      setManualScoreInput(q.manual_score !== null ? q.manual_score : "");
                    }}
                  >
                    Change Score
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Manual Score Change Modal */}
      <Modal
        show={!!activeQuestionForScoreEdit}
        onHide={() => setActiveQuestionForScoreEdit(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Change Score - Q{participantData.findIndex(q => q.question_id === activeQuestionForScoreEdit?.question_id) + 1}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangeScore}>
            <Form.Group className="mb-3">
              <Form.Label>Enter new score</Form.Label>
              <Form.Control
                type="number"
                min={
                    activeQuestionForScoreEdit
                    ? activeQuestionForScoreEdit.Question.negative_score_on_wrong_answer
                    : undefined
                }
                max={
                    activeQuestionForScoreEdit
                    ? activeQuestionForScoreEdit.Question.score_on_correct_answer
                    : undefined
                }
                value={manualScoreInput}
                onChange={(e) => setManualScoreInput(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="success">
              Save Score
            </Button>
          </Form>
          <p className="mt-3">
            <strong>Current Score:</strong>{" "}
            {activeQuestionForScoreEdit && getScore(activeQuestionForScoreEdit)}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setActiveQuestionForScoreEdit(null)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InviteDetailsAndScoreManually;
