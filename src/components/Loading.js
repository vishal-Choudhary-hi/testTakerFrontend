import React from "react";
import { motion } from "framer-motion";

const Loading = ({ message = "Loading...", type = "default" }) => {
    const style = {
        primaryButton: {
            dotColor: "white",
            messageColor: "white",
            divMargin: 0,
            messageFontSize: "18px",
            divDisplay: "flex",
            dotMarginTop: "0px",
            dotSize: "6px"
        },
        default: {
            dotColor: "#007bff",
            messageColor: "#555",
            divMargin: 0,
            messageFontSize: "18px",
            divDisplay: "",
            dotMarginTop: "10px",
            dotSize: "10px"
        }
    }
    const styleToApply = style[type];
    return (
        <div style={{ textAlign: "center", display: styleToApply.divDisplay, alignItems: "center", marginTop: styleToApply.divMargin }}>
            <p style={{ fontSize: styleToApply.messageFontSize, fontWeight: "bold", color: styleToApply.messageColor, marginRight: '5px' }}>{message}</p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: styleToApply.dotMarginTop }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: styleToApply.dotSize,
                            height: styleToApply.dotSize,
                            backgroundColor: styleToApply.dotColor,
                            borderRadius: "50%",
                            marginLeft: "5px",
                        }}
                        animate={{ y: [-5, 5, -5] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                        }}
                    ></motion.div>
                ))}
            </div>
        </div>
    );
};

export default Loading;
