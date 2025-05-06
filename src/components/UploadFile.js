import React, { useState, useRef, useEffect } from "react";
import apiCall from "../services/api";
import * as faceapi from "face-api.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
const UploadFile = ({
    type = "",
    onChangeDocumentId,
    index,
    uploadedByModelId,
    uploadedByModelType,
    uploadedDocumentIds,
    allowMultiple = false,
    faceDetect = false,
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [categoryDetails, setCategoryDetails] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [alreadyUploadedDocuments, setAlreadyUploadedDocuments] = useState([]);

    useEffect(() => {
        fetchAlreadyUploadedFiles();
    }, []);
    const fetchAlreadyUploadedFiles = async () => {
        if (uploadedDocumentIds && uploadedDocumentIds[0]) {
            const documentIdsString = uploadedDocumentIds.join(",");
            const response = await apiCall('get', `getUploadedDocuments?documentIds=${documentIdsString}`, null, null, true)
            setAlreadyUploadedDocuments(response.data);
        }
    }
    const fetchCategoryDetails = async () => {
        try {
            const response = await apiCall("GET", `getDocumentCategoryDetails?documentCategoryName=${type}`, {}, null, true);
            setCategoryDetails(response?.data);
        } catch (err) {
            setError("Failed to fetch document category details.");
        }
    };

    const validateFile = (file) => {
        if (!file || !categoryDetails) return "No file or category details found.";
        const allowedTypes = categoryDetails.allowedFileTypes || [];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (allowedTypes.length && !allowedTypes.includes(fileExtension)) {
            return `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`;
        }
        const maxSizeMB = categoryDetails.maxFileSize || 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File too large. Max size is ${maxSizeMB}MB.`;
        }
        return null;
    };

    const handleUpload = async () => {
        if (!selectedFiles.length) {
            setError("Please select a file before uploading.");
            return;
        }

        setUploading(true);
        setError("");

        let successfulIds = [];

        for (const file of selectedFiles) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                setUploading(false);
                return;
            }
            if (faceDetect) {
                const webcamImg = await faceapi.fetchImage(file);
                const liveDetection = await faceapi
                    .detectSingleFace(webcamImg)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!liveDetection) {
                    setError("No Face Detected: " + file.name);
                }
            }
            const formData = new FormData();
            formData.append("file", file);
            formData.append("uploadedByModelType", uploadedByModelType);
            formData.append("uploadedByModelId", parseInt(uploadedByModelId));
            formData.append("documentCategory", type);
            formData.append("documentName", file.name);
            try {
                const uploadResponse = await apiCall("POST", "uploadFileToCloud", formData, null, true);
                if (uploadResponse?.data?.id) {
                    successfulIds.push(uploadResponse.data.id);
                }
            } catch (err) {
                setError("Error uploading file: " + file.name);
            }
        }

        if (successfulIds.length > 0) {
            onChangeDocumentId(successfulIds, index);
            setShowModal(false);
            setSelectedFiles([]);
        }

        setUploading(false);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(allowMultiple ? files : [files[0]]);
        setError("");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(allowMultiple ? files : [files[0]]);
        setError("");
    };

    const removeFile = (index) => {
        const updated = [...selectedFiles];
        updated.splice(index, 1);
        setSelectedFiles(updated);
    };

    const openModal = () => {
        setSelectedFiles([]);
        setError("");
        fetchCategoryDetails();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setError("");
        setSelectedFiles([]);
    };
    return (
        <div className="upload-wrapper my-3">
            <Button variant="primary" onClick={openModal}>
                Upload File{alreadyUploadedDocuments.length > 0 ? ` (${alreadyUploadedDocuments.length} uploaded)` : ""}
            </Button>

            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Documents</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`drop-zone border rounded p-4 text-center mb-3 ${dragOver ? "bg-light" : ""}`}
                        style={{ borderStyle: 'dashed', cursor: "pointer" }}
                    >
                        Drag and drop {allowMultiple ? "files" : "a file"} here or use the button below
                    </div>

                    <div className="text-center mb-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            multiple={allowMultiple}
                            accept={categoryDetails?.allowedFileTypes?.map(ext => `.${ext}`).join(',') || "*/*"}
                        />
                        <Button variant="secondary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                            {uploading ? <Spinner animation="border" size="sm" /> : "Choose File(s)"}
                        </Button>
                    </div>
                    {selectedFiles.length > 0 && (
                        <ListGroup className="selected-files mb-3">
                            {selectedFiles.map((file, idx) => (
                                <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                    <span>{file.name}</span>
                                    <Button size="sm" variant="outline-danger" onClick={() => removeFile(idx)}>Delete</Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}

                    {categoryDetails && (
                        <div className="text-muted text-center small">
                            <div><strong>Allowed Types:</strong> {categoryDetails.allowedFileTypes?.join(", ") || 'Any'}</div>
                            <div><strong>Max Size:</strong> {categoryDetails.maxFileSize}MB</div>
                        </div>
                    )}
                    {alreadyUploadedDocuments.length > 0 && (
                        <div className="uploaded-files-section mb-3">
                            <h5 className="mb-3">Uploaded Files</h5>
                            <ListGroup className="selected-files">
                                {alreadyUploadedDocuments.map((doc) => (
                                    <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
                                        <a
                                            href={doc.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none text-primary"
                                            title="Open file"
                                        >
                                            {doc.name}
                                        </a>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal} disabled={uploading}>Cancel</Button>
                    <Button variant="success" onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
                        {uploading ? <Spinner animation="border" size="sm" /> : "Upload"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UploadFile;
