import React, { useEffect, useState } from "react";
import apiCall from "../../../services/api";

const StartTestSection = ({ testId, sectionId, onMarkSectionCompleted }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await apiCall(
        "GET",
        `dashboard/participant/sectionTestQuestions?testId=${testId}&sectionId=${sectionId}`,
        null,
        null,
        true
      );
      setQuestions(res.data.questions);
      setLoading(false);
    };
    fetchQuestions();
  }, [testId, sectionId]);

  const currentQuestion = questions[currentIndex];
  const qType = currentQuestion?.QuestionType || {};
  const questionId = currentQuestion?.id;

  const answer = answers[questionId] ?? (
    qType.allow_options
      ? []
      : ""
  );

  const handleOptionChange = (optionId) => {
    let current = null;
    if (qType.allow_multiple_correct_answer) {
         current = answers[questionId] || [];
    }else{
         current =[];
    }
    const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    setAnswers((prev) => ({ ...prev, [questionId]: updated }));
  };

  const handleTextChange = (e) => {
    setAnswers((prev) => ({ ...prev, [questionId]: e.target.value }));
  };

  const handleSaveAndNext = async () => {
    await saveAnswer(testId, questionId, false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onMarkSectionCompleted(sectionId);
    }
  };

  const handleSkip = async() => {
    await saveAnswer(testId, questionId, true);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onMarkSectionCompleted(sectionId);
    }
  };

  const saveAnswer = async (testId,questionId,skip=false) => {
    await apiCall("POST", "dashboard/participant/saveAnswer", {
        testId,
      questionId,
      answer: qType.manual_scoring ? answers[questionId] : "",
      optionIds:answers[questionId],
      skipped: skip,
    }, null, true);
  }

  if (loading || !currentQuestion) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3 text-muted">
            Question {currentIndex + 1} of {questions.length}
          </div>

          <h5 className="card-title">
            Q{currentIndex + 1}: {currentQuestion.question}
          </h5>

          {currentQuestion.image && (
            <img
              src={currentQuestion.image}
              alt="Question"
              className="img-fluid rounded mb-3"
            />
          )}

          <p className="text-secondary mb-3">
            <strong>Type:</strong> {qType.label}{" "}
            <span className="ms-3 text-success">+{currentQuestion.score_on_correct_answer}</span> /{" "}
            <span className="text-danger">-{currentQuestion.negative_score_on_wrong_answer}</span>
          </p>

          {qType.allow_options ? (
            <div className="mb-3">
              {currentQuestion.Options.map((opt) => {
                const isChecked = answer.includes(opt.id)
                return (
                  <div className="form-check" key={opt.id}>
                    <input
                      className="form-check-input"
                      type={qType.allow_multiple_correct_answer ? "checkbox" : "radio"}
                      name={`q-${questionId}`}
                      value={opt.id}
                      id={`opt-${opt.id}`}
                      checked={isChecked}
                      onChange={() => handleOptionChange(opt.id)}
                    />
                    <label className="form-check-label" htmlFor={`opt-${opt.id}`}>
                      {opt.description}
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Type your answer here..."
                value={answer}
                onChange={handleTextChange}
              />
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={handleSkip}
            >
              Skip
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSaveAndNext}
              disabled={
                qType.allow_options
                  ? (!answer || (Array.isArray(answer) && answer.length === 0))
                  : answer.trim() === ""
              }
            >
              Save and Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartTestSection;
