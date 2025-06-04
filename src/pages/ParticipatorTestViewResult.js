import React, { useEffect, useRef, useState } from "react";
import apiCall from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useParams } from "react-router-dom";
import { Card, Spinner, Badge } from "react-bootstrap";

const ParticipatorTestViewResult = () => {
  const isMounted = useRef(false);
  const { testId } = useParams();
  const { showSnackbar} = useSnackbar();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    fetchTestResult();
  }, []);

  const fetchTestResult = async () => {
    try {
      const response = await apiCall(
        "GET",
        `dashboard/participant/testParticipantResults?testId=${testId}`,
        null,
        showSnackbar,
        true
      );
      setTestResult(response.data);
    } catch (err) {
      showSnackbar("Failed to fetch test results.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getScoreDisplay = (item) => {
    if (item.skipped) return "Skipped (0)";
    if (item.Question.manual_scoring) {
      return item.manual_score !== null ? `+${item.manual_score} (Manual)` : "Pending Manual Scoring";
    }
    if(item.manual_score !== null && !item.Question.manual_scoring) {
        return `${item.manual_score>=0?'+':''} ${item.manual_score} (Manual)`;
    }
    return item.score>=0
      ? `+${item.score}`
      : `${item.score}`;
  };

  const renderOptions = (question, selectedIds = []) => {
    return (
      <ul className="mb-2">
        {question.Options.map((opt) => {
          const isSelected = selectedIds.includes(opt.id);
          const isCorrect = opt.is_correct;

          return (
            <li
              key={opt.id}
              style={{
                color: isCorrect ? "green" : isSelected ? "red" : "black",
                fontWeight: isSelected ? "bold" : "normal",
              }}
            >
              {opt.description}
              {isCorrect && " ✅"}
              {isSelected && !isCorrect && " ❌"}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Test Results</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : !testResult ? (
        <p>No result available.</p>
      ) : (
        <>
          <h5 className="mb-4">Participant: {testResult.TestInvite?.name}</h5>

          {testResult.SelectedOptionMapping.map((item, index) => (
            <Card className="mb-4" key={index}>
              <Card.Body>
                <Card.Title>
                  Q{index + 1}. {item.Question.question}
                  {item.Question.manual_scoring && (
                    <Badge bg="warning" text="dark" className="ms-2">
                      Manual Scoring
                    </Badge>
                  )}
                </Card.Title>

                {item.Question.Options.length > 0 &&
                  renderOptions(item.Question, item.option_ids || [])}

                {item.input_value && (
                  <p>
                    <strong>Your Answer:</strong> {item.input_value}
                  </p>
                )}

                <p>
                  <strong>Score:</strong> {getScoreDisplay(item)}
                </p>
              </Card.Body>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default ParticipatorTestViewResult;
