import React, { useContext, useState } from "react"
import { Form, Button } from "react-bootstrap";
import { FaTrash, FaCheckCircle } from "react-icons/fa";
import { MdEmail, MdMarkEmailUnread } from "react-icons/md";
import Loading from "../Loading";
import { useSnackbar } from "../../contexts/SnackbarContext";
import UploadFile from "../UploadFile";
import { AuthContext } from "../../contexts/AuthContext";


const TestParticipantsForm = ({ handleNext, prefilledData }) => {
    const { user } = useContext(AuthContext);
    const userId = user.id;
    const [testParticipants, setTestParticipants] = useState(() => {
        if (prefilledData) {
            let testInvitations = prefilledData.TestInvitations;
            let modifiedTestInvitations = testInvitations.map((testInvitation) => {
                return {
                    name: testInvitation.name,
                    email: testInvitation.email,
                    verification_image_document_id: testInvitation.verification_image_document_id,
                    accepted: testInvitation.accepted,
                    emailStatus: testInvitation.email_status
                };
            })
            return [...modifiedTestInvitations];
        } else {
            return [{ name: "", email: "", verification_image_document_id: null, accepted: false, emailStatus: false }];
        }
    }
    );
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    const maxParticipantLength = 3;

    const CHARACTER_LIMITS = {
        name: 100,
        email: 255,
    };
    const removeParticipant = (index) => {
        let holder = testParticipants;
        if (holder.length === 1) {
            holder = [{ name: "", email: "", accepted: false, emailStatus: false }];
        } else {
            holder.splice(index, 1);
        }
        setTestParticipants([...holder]);
    };
    const addParticipant = () => {
        if (testParticipants.length === maxParticipantLength) {
            showSnackbar(`Can Not Add More Than ${maxParticipantLength} Participants`, "error");
            return;
        }
        setTestParticipants([...testParticipants, { name: "", email: "", verification_image_document_id: null, accepted: false, emailStatus: false }]);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let requestData = testParticipants.map((testParticipant) => {
            return {
                name: testParticipant.name,
                email: testParticipant.email,
                verification_image_document_id: testParticipant.verification_image_document_id
            }
        })
        await handleNext(requestData);
        setLoading(false);
    }
    const handleParticipantChange = (index, key, value) => {
        let updatedTestParticipants = testParticipants;
        updatedTestParticipants[index][key] = value;
        setTestParticipants([...updatedTestParticipants]);
    }
    const onChangeDocumentIdEvent = (documentIds, index) => {
        let updatedTestParticipants = testParticipants;
        updatedTestParticipants[index]['verification_image_document_id'] = documentIds[0];
        setTestParticipants([...updatedTestParticipants]);
    }
    return (
        <div>
            <h4 className="text-center mb-4">Test Participants</h4>
            <Form onSubmit={handleSubmit}>
                <div className="overflow-auto hide-scrollbar" style={{ maxHeight: "400px" }}>
                    {testParticipants.map((participant, index) => (
                        <div key={index} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center pr-3">
                                <Form.Label>
                                    Participant {index + 1} *{" "}
                                </Form.Label>
                                <div className="d-flex justify-content-between align-items-center" style={{ width: "15%" }}>
                                    {
                                        !participant.accepted ?
                                            <Button variant="outline-danger" size="sm" onClick={() => removeParticipant(index)}>
                                                <FaTrash style={{ fontSize: "20px" }} title="Delete Participant" />
                                            </Button>
                                            :
                                            <FaCheckCircle style={{ color: "green", fontSize: "20px" }} title="Invitation Accepted" />
                                    }
                                    {!participant.emailStatus ? (
                                        <MdMarkEmailUnread style={{ color: "gray", fontSize: "20px" }} title="Email not sent" />
                                    ) : (
                                        <MdEmail style={{ color: "green", fontSize: "20px" }} title="Email sent" />
                                    )}
                                </div>
                            </div>
                            <Form.Group className="mb-2 mt-2">
                                <Form.Control
                                    type="text"
                                    value={participant.name}
                                    placeholder="Participant Name"
                                    maxLength={CHARACTER_LIMITS.name}
                                    onChange={(e) => handleParticipantChange(index, "name", e.target.value)}
                                    required
                                />
                                <small className="text-muted">{participant.name.length}/{CHARACTER_LIMITS.name}</small>
                            </Form.Group>

                            <Form.Group>
                                <Form.Control
                                    type="email"
                                    placeholder="Participant Email"
                                    value={participant.email}
                                    onChange={(e) => handleParticipantChange(index, "email", e.target.value)}
                                    required
                                    maxLength={CHARACTER_LIMITS.email}
                                />
                                <small className="text-muted">{participant.name.length}/{CHARACTER_LIMITS.email}</small>
                            </Form.Group>
                            <UploadFile type="verification_image" onChangeDocumentId={onChangeDocumentIdEvent} index={index} uploadedByModelType='userTestCreater' uploadedByModelId={userId} uploadedDocumentIds={[participant.verification_image_document_id]} faceDetect={true} />
                        </div>
                    ))
                    }
                </div>
                <div className="d-flex justify-content-start mb-3">
                    <Button variant="outline-primary" onClick={addParticipant}>+ Add Participant</Button>
                </div>
                <div className="d-flex justify-content-center">
                    <Button type="submit" style={{ width: "70%", display: "flex", alignItems: "center", justifyContent: "center", height: "40px" }} disabled={loading}>
                        {loading && <Loading message="Saving Test" type='primaryButton' />}
                        {!loading && 'Save And Next ➡️'}
                    </Button>
                </div>
            </Form >
        </div>
    )
}
export default TestParticipantsForm