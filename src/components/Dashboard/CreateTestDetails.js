import React, { useState } from "react";
import { Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle, FaTrash } from "react-icons/fa";
import { convertTimeFormate, secondsToHHMM } from "../../services/functions";
import Loading from "../Loading";
const CreateTestDetails = ({ handleNext, prefilledData }) => {
    prefilledData = prefilledData ?? {};
    const [formData, setFormData] = useState({
        testName: prefilledData.test_name ?? "",
        testDescription: prefilledData.description ?? "",
        testStartTime: prefilledData.start_time ? convertTimeFormate(prefilledData.start_time) : "",
        testEndTime: prefilledData.end_time ? convertTimeFormate(prefilledData.end_time) : "",
        testDurationInSeconds: prefilledData.duration_in_seconds ? secondsToHHMM(prefilledData.duration_in_seconds) : "",
        studyMaterial: prefilledData.study_material ?? "",
        inviteEmailAdditionalContent: prefilledData.invite_email_additional_content ?? "",
        testInstructions: prefilledData.TestInstructions ?? [],
    });
    const [loading, setLoading] = useState(false);
    const CHARACTER_LIMITS = {
        testName: 255,
        testDescription: 500,
        inviteEmailAdditionalContent: 500,
        instructionHeading: 255,
        instructionDescription: 500,
    };

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value.length <= (CHARACTER_LIMITS[name] || Infinity)) {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle File Upload
    const handleFileChange = (e) => {
        setFormData({ ...formData, studyMaterial: e.target.files[0] });
    };

    // Handle Dynamic Instructions
    const handleInstructionChange = (index, field, value) => {
        const updatedInstructions = [...formData.testInstructions];
        if (value.length <= (field === "heading" ? CHARACTER_LIMITS.instructionHeading : CHARACTER_LIMITS.instructionDescription)) {
            updatedInstructions[index][field] = value;
            setFormData({ ...formData, testInstructions: updatedInstructions });
        }
    };

    const addInstruction = () => {
        setFormData({
            ...formData,
            testInstructions: [...formData.testInstructions, { heading: "", description: "" }],
        });
    };
    const removeInstruction = (index) => {
        let instruction = formData.testInstructions;
        if (instruction.length === 1) {
            instruction = [];
        } else {
            formData.testInstructions.splice(index, 1);
        }
        setFormData({
            ...formData,
            testInstructions: instruction,
        });
    };

    // Info Tooltip
    const renderTooltip = (message) => (
        <Tooltip id="tooltip">{message}</Tooltip>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let testDurationInSeconds = formData.testDurationInSeconds;
        const [hours, minutes] = testDurationInSeconds.split(":").map(Number);
        testDurationInSeconds = hours * 3600 + minutes * 60;
        await handleNext({ ...formData, testDurationInSeconds });
        setLoading(false);
    }
    return (
        <div>
            <h4 className="text-center mb-4">Test Details</h4>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>
                        Test Name *{" "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("Enter the test's name.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="testName"
                        value={formData.testName}
                        onChange={handleChange}
                        maxLength={CHARACTER_LIMITS.testName}
                        required
                    />
                    <small className="text-muted">{formData.testName.length}/{CHARACTER_LIMITS.testName}</small>
                </Form.Group>

                {/* Test Description */}
                <Form.Group className="mb-3">
                    <Form.Label>
                        Test Description *{" "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("Provide a brief description of the test.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="testDescription"
                        value={formData.testDescription}
                        onChange={handleChange}
                        maxLength={CHARACTER_LIMITS.testDescription}
                        required
                    />
                    <small className="text-muted">{formData.testDescription.length}/{CHARACTER_LIMITS.testDescription}</small>
                </Form.Group>

                {/* Test Start Time */}
                <Form.Group className="mb-3">
                    <Form.Label>Test Start Time * {" "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("The start time of the test from which the participant can enter in the test.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger></Form.Label>
                    <Form.Control type="datetime-local" name="testStartTime" value={formData.testStartTime} onChange={handleChange} required />
                </Form.Group>

                {/* Test End Time */}
                <Form.Group className="mb-3">
                    <Form.Label>Test End Time  *{" "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("The last time by which a participant can enter in the test.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control type="datetime-local" name="testEndTime" value={formData.testEndTime} onChange={handleChange} required />
                </Form.Group>

                {/* Test Duration */}
                <Form.Group className="mb-3">
                    <Form.Label>Test Duration *{" "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("The duration of the test.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control type="time" name="testDurationInSeconds" value={formData.testDurationInSeconds} onChange={handleChange} required />
                </Form.Group>

                {/* Study Material Upload */}
                <Form.Group className="mb-3">
                    <Form.Label>Study Material {" "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("Upload any study material you want to provide for the participants to prepare.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                {/* Invite Email Additional Content */}
                <Form.Group className="mb-3">
                    <Form.Label>
                        Invite Email Additional Content {"  "}
                        <OverlayTrigger placement="right" overlay={renderTooltip("Include any additional content for the email invitation.")}>
                            <FaInfoCircle className="text-muted" />
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="inviteEmailAdditionalContent"
                        value={formData.inviteEmailAdditionalContent}
                        onChange={handleChange}
                        maxLength={CHARACTER_LIMITS.inviteEmailAdditionalContent}
                    />
                    <small className="text-muted">{formData.inviteEmailAdditionalContent.length}/{CHARACTER_LIMITS.inviteEmailAdditionalContent}</small>
                </Form.Group>

                {/* Test Instructions Section */}
                <h5 className="mt-4">Test Instructions</h5>
                {formData.testInstructions.map((instruction, index) => (
                    <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center pr-3">
                            <Form.Label>
                                <div>
                                    Test Instruction {index + 1} *{" "}
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={renderTooltip("Enter the test's instructions which can solve the participant's query.")}>
                                        <FaInfoCircle className="text-muted ms-2" />
                                    </OverlayTrigger>
                                </div>
                            </Form.Label>

                            <Button variant="outline-danger" size="sm" onClick={() => removeInstruction(index)}>
                                <FaTrash style={{ fontSize: "0.8rem" }} />
                            </Button>
                        </div>
                        <Form.Group className="mb-2 mt-2">
                            <Form.Control
                                type="text"
                                value={instruction.heading}
                                placeholder="Instruction Heading"
                                onChange={(e) => handleInstructionChange(index, "heading", e.target.value)}
                                maxLength={CHARACTER_LIMITS.instructionHeading}
                                required
                            />
                            <small className="text-muted">{instruction.heading.length}/{CHARACTER_LIMITS.instructionHeading}</small>
                        </Form.Group>

                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Instruction Description"
                                value={instruction.description}
                                onChange={(e) => handleInstructionChange(index, "description", e.target.value)}
                                maxLength={CHARACTER_LIMITS.instructionDescription}
                                required
                            />
                            <small className="text-muted">{instruction.description.length}/{CHARACTER_LIMITS.instructionDescription}</small>
                        </Form.Group>
                    </div>
                ))
                }

                {/* Add Instruction Button */}
                <div className="d-flex justify-content-start mb-3">
                    <Button variant="outline-primary" onClick={addInstruction}>+ Add Instruction</Button>
                </div>
                <div className="d-flex justify-content-center">
                    <Button type="submit" style={{ width: "70%", display: "flex", alignItems: "center", justifyContent: "center", height: "40px" }} disabled={loading}>
                        {loading && <Loading message="Saving Test" type='primaryButton' />}
                        {!loading && 'Save And Next ➡️'}
                    </Button>
                </div>
            </Form >
        </div >
    );
};

export default CreateTestDetails;
