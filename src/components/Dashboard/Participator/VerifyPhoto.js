import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Button, Spinner } from "react-bootstrap";
import apiCall from "../../../services/api";

const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: "user",
};

const VerifyPhoto = ({ onValidate, testId }) => {
    const webcamRef = useRef(null);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [retry, setRetry] = useState(false);
    const modalRef = useRef(null);
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "/models";
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            setLoading(false);
        };
        loadModels();
    }, []);
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "/models";
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setLoading(false);
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!loading && show && !retry) {
            const interval = setInterval(async () => {
                if (
                    webcamRef.current &&
                    webcamRef.current.video &&
                    webcamRef.current.video.readyState === 4
                ) {
                    const video = webcamRef.current.video;
                    const detections = await faceapi.detectAllFaces(
                        video,
                        new faceapi.TinyFaceDetectorOptions()
                    );
                    if (detections.length === 1) {
                        handleCapture();
                        clearInterval(interval);
                    }
                }
            }, 500);

            return () => clearInterval(interval);
        }
    }, [loading, show, retry]);

    const handleCapture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setFeedback({ type: "info", message: "Validating your photo..." });
        await validatePhoto(imageSrc);
    };
    const getTestVerificationImage = async () => {
        const res = await apiCall("get", `dashboard/participant/getTestVerificationImage?testId=${testId}`, null, null, true);
        return res.data.image;
    };
    const validatePhoto = async (webcamImage) => {
        try {
            const referenceBase64 = await getTestVerificationImage();
            const referenceImage = await faceapi.fetchImage(referenceBase64);
            const refDetection = await faceapi
                .detectSingleFace(referenceImage)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!refDetection) {
                setFeedback({ type: "danger", message: "No face detected in reference image." });
                setRetry(true);
                return;
            }

            const webcamImg = await faceapi.fetchImage(webcamImage);
            const liveDetection = await faceapi
                .detectSingleFace(webcamImg)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!liveDetection) {
                setFeedback({ type: "danger", message: "No face detected in webcam image." });
                setRetry(true);
                return;
            }

            const distance = faceapi.euclideanDistance(refDetection.descriptor, liveDetection.descriptor);

            if (distance < 0.6) {
                setFeedback({ type: "success", message: "Face matched successfully!" });
                if (onValidate) onValidate(true);
                setTimeout(() => setShow(false), 1500);
            } else {
                setFeedback({ type: "danger", message: "Face does not match. Try again." });
                setRetry(true);
                if (onValidate) onValidate(false);
            }
        } catch (err) {
            console.error("Error validating face:", err);
            setFeedback({ type: "danger", message: "Validation error." });
            setRetry(true);
        }
    };


    const handleRetry = () => {
        setFeedback(null);
        setRetry(false);
    };

    const handleClose = () => {
        setShow(false);
        setFeedback(null);
        setRetry(false);
    };

    // Close the modal if clicked outside of it
    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleClose();
        }
    };

    useEffect(() => {
        if (show) {
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [show]);

    const feedbackColor = {
        success: "rgba(0, 128, 0, 0.6)",
        danger: "rgba(255, 0, 0, 0.6)",
        info: "rgba(0, 123, 255, 0.6)",
    };

    return (
        <>
            <div style={{ marginBottom: "20px" }}>
                <p><strong>Why is face verification required?</strong></p>
                <p>
                    Face verification ensures that the person taking the test is the
                    same as the one registered for it, maintaining the integrity of the
                    test-taking process.
                </p>
                <p><strong>Where will the verification image come from?</strong></p>
                <p>
                    The image used for verification will be compared with a photo provided
                    by the test creator during the registration process.
                </p>
                <p><strong>How should I sit for the verification?</strong></p>
                <p>
                    Please sit in a well-lit area, ensuring your face is clearly visible to
                    the camera. Ensure that there are no distractions or obstructions in the
                    background. Position yourself facing the camera at a comfortable distance.
                </p>
            </div>

            <Button variant="primary" onClick={() => setShow(true)}>
                Start Face Verification
            </Button>

            {show && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        ref={modalRef}
                        style={{
                            width: "520px",
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "16px",
                            padding: "20px",
                            position: "relative",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                            overflow: "hidden",
                        }}
                    >
                        <h5 style={{ color: "#fff", marginBottom: "12px" }}>Face Verification</h5>

                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "10px",
                                objectFit: "cover",
                            }}
                        />

                        {(loading || feedback) && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    background: loading
                                        ? "rgba(0,0,0,0.6)"
                                        : feedbackColor[feedback?.type],
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "white",
                                    textAlign: "center",
                                    padding: "20px",
                                    transition: "all 0.3s ease-in-out",
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" variant="light" />
                                        <div style={{ marginTop: "10px" }}>
                                            Loading face detection model...
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h6>{feedback?.message}</h6>
                                        {retry && (
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={handleRetry}
                                                style={{ marginTop: "10px" }}
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default VerifyPhoto;
