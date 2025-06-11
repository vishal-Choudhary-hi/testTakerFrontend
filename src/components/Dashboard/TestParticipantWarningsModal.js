import React from "react";
import { Modal, ListGroup, Alert } from "react-bootstrap";

const variants = ["danger", "warning", "secondary", "info", "dark"]; // you can expand this

const TestParticipantWarningsModal = ({ show, onHide, warnings = [] }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Test Participant Warnings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {warnings.length === 0 ? (
          <Alert variant="info">No warnings found for this participant.</Alert>
        ) : (
          <ListGroup>
            {warnings.map((message, index) => (
              <ListGroup.Item
                key={index}
                variant={variants[index % variants.length]}
              >
                <strong>Warning {index + 1}:</strong> {message}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TestParticipantWarningsModal;
