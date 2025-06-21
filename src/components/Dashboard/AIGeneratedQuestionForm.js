import React, { useState } from 'react';
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import EditQuestionModal from './EditQuestionModal';

const AIGeneratedQuestionForm = ({
  onChange,
  aISuggestedQuestions,
  generateAIQuestions,
  setShowAIQuestionModalForm,
}) => {
  const [openQuestionPopUp, setOpenQuestionPopUp] = useState(null);

  return (
    <div className="position-relative">
      <h4>AI Suggested Questions</h4>
      {aISuggestedQuestions?.map((q, index) => (
        <div key={index} className="mb-3">
          <strong>Q{index + 1}:</strong> {q.question}
          <ul>
            {q.options.map((opt, optIndex) => (
              <li key={optIndex}>
                {opt.description}
                {opt.is_correct && <strong> ✔</strong>}
              </li>
            ))}
          </ul>
          <Button variant="primary" onClick={() => onChange(q)}>
            Add Question +
          </Button>
        </div>
      ))}

      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mt-3">
        <Button onClick={generateAIQuestions} variant="primary">
          + Generate More
        </Button>
        <Button onClick={() => setShowAIQuestionModalForm(true)} variant="outline-secondary">
          ✏️ Edit AI Instructions
        </Button>
      </div>
    </div>
  );
};

export default AIGeneratedQuestionForm;
