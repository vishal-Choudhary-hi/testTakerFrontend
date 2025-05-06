import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ListTest from "./ListTests";

const CreateView = () => {
    const navigate = useNavigate();
    return (
        <div>
            <div>
                <h4 className="fw-bold mb-1">Create New Test</h4>
                <Card className="shadow-sm p-2 rounded border-0">
                    <Row className="d-flex justify-content-between align-items-center">
                        {/* Left: Heading & Text */}
                        <Col xs="auto">
                            <p className="text-muted mb-0">
                                This platform allows you to create and manage tests effortlessly.
                            </p>
                        </Col>

                        {/* Right: Button */}
                        <Col xs="auto">
                            <Button variant="primary" className="btn-lg shadow-sm px-4" onClick={() => navigate('/dashboard/createTest')}>
                                + Create Test
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </div>
            <ListTest role='creator' />
        </div>
    );
};

export default CreateView;
