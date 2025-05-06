import React, { useEffect, useState, useRef } from "react";
import TestItem from "./TestItem";
import apiCall from "../../services/api";
import { Form, Button, InputGroup, Row, Col } from "react-bootstrap";

const ListTest = ({ role }) => {
    const [testList, setTestList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const limit = 3;

    useEffect(() => {
        fetchTests();
    }, [page, statusFilter, startDate, endDate]);

    const fetchTests = async () => {
        let endPoint = '';
        if (role === 'creator') {
            endPoint = 'dashboard/creater/getAllTest';
        } else if (role === 'participant') {
            endPoint = 'dashboard/participant/allUserParticipationTest';
        }
        let response = await apiCall(
            "GET",
            `${endPoint}?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter}&startDate=${startDate}&endDate=${endDate}`,
            {},
            null,
            true
        );
        if (response?.data) {
            setTestList(response.data.tests);
            setTotalPages(response.data.totalPages);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchTests();
    };

    return (
        <div>
            <h4 className="fw-bold mb-3">All Tests</h4>

            {/* Search & Filters in a Single Line */}
            <Form onSubmit={handleSearch} className="mb-3">
                <Row className="align-items-center g-2">
                    {/* Search Input */}
                    <Col md="3">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search by test name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="primary" type="submit">🔍</Button>
                        </InputGroup>
                    </Col>

                    {/* Status Filter */}
                    {role == 'creator' &&
                        <Col md="2">
                            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="done">Done</option>
                                <option value="delete">Deleted</option>
                            </Form.Select>
                        </Col>
                    }

                    {/* Start Date */}
                    <Col md="2">
                        <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Col>

                    {/* End Date */}
                    {role == 'creator' &&

                        <Col md="2">
                            <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </Col>
                    }
                    {/* Clear Button */}
                    <Col md="2">
                        <Button variant="outline-secondary" onClick={() => { setStartDate(""); setEndDate(""); setStatusFilter(""); setSearchQuery(""); fetchTests(); }}>
                            Clear Filters
                        </Button>
                    </Col>
                </Row>
            </Form>

            {/* Test List */}
            <div className="test-list">
                {testList.length > 0 ? (
                    testList.map((test) => <TestItem key={test.id} testDetails={test} role={role} />)
                ) : (
                    <p className="text-muted">No tests available.</p>
                )}
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>⬅️ Previous</Button>
                <span>Page {page} of {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next ➡️</Button>
            </div>
        </div>
    );
};

export default ListTest;
