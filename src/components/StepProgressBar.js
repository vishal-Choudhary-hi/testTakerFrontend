import React from "react";
import { Row, Col } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";

const StepProgressBar = ({ totalSteps, currentStep }) => {
    return (
        <Row className="justify-content-center align-items-center">
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

                return (
                    <Col key={index} xs="auto" className="d-flex align-items-center">
                        {/* Step Circle */}
                        <div
                            className={`step-circle ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                        >
                            {stepNumber}
                        </div>

                        {/* Arrow Connector (except for last step) */}
                        {stepNumber !== totalSteps && (
                            <FaArrowRight
                                className={`step-arrow ${isCompleted ? "completed" : ""}`}
                            />
                        )}
                    </Col>
                );
            })}
        </Row>
    );
};

export default StepProgressBar;
