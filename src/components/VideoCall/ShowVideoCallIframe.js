import React, { useRef, useEffect, useState } from "react";

const ShowVideoCallIframe = ({ link,onDisconnect }) => {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 100, y: 100 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  const onMouseDown = (e) => {
    setDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = (e) => {
    if (dragging) {
      setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    }
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  const handleClose = () => {
    if (onDisconnect) {
      onDisconnect();
    }
    setVisible(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Handle message from iframe (e.g. to close window)
    const handleMessage = (event) => {
      // You can restrict origin check if needed
      if (event.data?.type === "close") {
        handleClose();
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("message", handleMessage);
    };
  }, [dragging]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: offset.y,
        left: offset.x,
        width: "400px",
        height: "300px",
        zIndex: 9999,
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "6px 12px",
          cursor: "move",
          fontWeight: "bold",
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onMouseDown={onMouseDown}
      >
        <span>Video Call</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{
            background: "transparent",
            color: "#fff",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          width: "1000px",
          height: "700px",
          transform: "scale(0.4)",
          transformOrigin: "top left",
        }}
      >
        <iframe
          src={link}
          title="Video Call"
          allow="camera; microphone; fullscreen"
          allowFullScreen
          style={{
            width: "1000px",
            height: "700px",
            border: "none",
          }}
        />
      </div>
    </div>
  );
};

export default ShowVideoCallIframe;
