import React from "react";

const About = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center bg-light p-4">
            <h1 className="display-4 text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>About TestTaker</h1>
            <p className="lead text-secondary" style={{ fontFamily: "Poppins, sans-serif", maxWidth: "800px" }}>
                TestTaker is an innovative platform designed to make online exams and surveys seamless and efficient.
                Whether you are setting up exams, taking them, or analyzing the results, TestTaker simplifies the process from every viewpoint.
                <br /><br />
                Our platform offers AI-powered proctoring features, including:
            </p>
            <ul className="text-secondary" style={{ fontSize: "1.1rem", textAlign: "left", maxWidth: "700px" }}>
                <li>Face recognition for verifying test-takers' identity</li>
                <li>Time-to-time face tracking to ensure integrity</li>
                <li>AI monitoring for suspicious activities during exams</li>
                <li>Comprehensive result analysis for better insights</li>
            </ul>
            <p className="lead text-secondary" style={{ fontFamily: "Poppins, sans-serif", maxWidth: "800px" }}>
                With TestTaker, conducting and managing online assessments has never been easier.
            </p>
        </div>
    );
};

export default About;
