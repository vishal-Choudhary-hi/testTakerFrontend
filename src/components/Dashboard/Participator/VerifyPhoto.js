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

const VerifyPhoto = ({
  onValidate,
  testId,
  showOnlyFaceCam = false,
  customStyle = null,
  verifyFaceOnRegularIntervals = false,
}) => {
  const webcamRef = useRef(null);
  const [show, setShow] = useState(showOnlyFaceCam);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [retry, setRetry] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const modalRef = useRef(null);

  // Load models only once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setLoading(false);
    };
    loadModels();
  }, []);

  // Periodic detection
  useEffect(() => {
    if (!loading && show ) {
      const interval = setInterval(() => {
        if (!isVerifying) {
          handleCapture();
        }
      }, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [loading, show]);

  const handleCapture = async () => {
    try {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        setIsVerifying(true);
        const imageSrc = webcamRef.current.getScreenshot();
        setFeedback({ type: "info", message: "Validating your photo..." });
        await validatePhoto(imageSrc);
        setIsVerifying(false);
      }
    } catch (err) {
      console.error("Capture Error:", err);
      setIsVerifying(false);
    }
  };

  const getTestVerificationImage = async () => {
    const res = await apiCall(
      "get",
      `dashboard/participant/getTestVerificationImage?testId=${testId}`,
      null,
      null,
      true
    );
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
        setFeedback({ type: "danger", message: "No face in reference image." });
        setRetry(true);
        if (onValidate) onValidate(false);
        return;
      }

      const webcamImg = await faceapi.fetchImage(webcamImage);
      const liveDetection = await faceapi
        .detectSingleFace(webcamImg)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!liveDetection) {
        setFeedback({ type: "danger", message: "No face in webcam image." });
        setRetry(true);
        if (onValidate) onValidate(false);
        return;
      }

      const distance = faceapi.euclideanDistance(
        refDetection.descriptor,
        liveDetection.descriptor
      );

      if (distance < 0.6) {
        setFeedback({ type: "success", message: "Face matched!" });
        if (onValidate) onValidate(true);
        if (!verifyFaceOnRegularIntervals && !showOnlyFaceCam) {
          setTimeout(() => setShow(false), 1500);
        }
      } else {
        setFeedback({ type: "danger", message: "Face mismatch. Try again." });
        setRetry(true);
        if (onValidate) onValidate(false);
      }
    } catch (err) {
      setFeedback({ type: "danger", message: "Validation error." });
      setRetry(true);
      if (onValidate) onValidate(false);
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

  useEffect(() => {
    if (verifyFaceOnRegularIntervals) return;
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  const feedbackColor = {
    success: "rgba(0, 128, 0, 0.6)",
    danger: "rgba(255, 0, 0, 0.6)",
    info: "rgba(0, 123, 255, 0.6)",
  };

  return (
    <>
      {!showOnlyFaceCam && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <p><strong>Why is face verification required?</strong></p>
            <p>Face verification ensures test integrity by confirming participant identity.</p>
            <p><strong>How is it done?</strong></p>
            <p>It compares your live image with the image uploaded by the test creator.</p>
            <p><strong>Tips:</strong> Sit in a well-lit place with your face clearly visible.</p>
          </div>
          <Button variant="primary" onClick={() => setShow(true)}>
            Start Face Verification
          </Button>
        </>
      )}

      {show && (
        <div
          style={
            customStyle ?? {
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
            }
          }
        >
          <div
            ref={modalRef}
            style={{
              width: "90%",
              backdropFilter: "blur(12px)",
              borderRadius: "16px",
              padding: "3%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!showOnlyFaceCam && (
              <h5 style={{ color: "#fff", marginBottom: "12px" }}>Face Verification</h5>
            )}

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

            {(loading || feedback) && !showOnlyFaceCam && (
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
