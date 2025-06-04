import React, { useEffect, useState, useRef } from "react";
import TestItem from "./TestItem";
import apiCall from "../../services/api";
import { Form, Button, InputGroup, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import DateRangeFilter from "../Global/DateRangeFilter";

const ListTest = ({ role }) => {
    const [testList, setTestList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [testStatuses, setTestStatuses] = useState([]);
    const [dateRangePopUpVisible, setDateRangePopUpVisible] = useState(false);
    const limit = 3;

    useEffect(() => {
        fetchTests();
        fetchTestStatus();
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
    const fetchTestStatus = async () => {
        let response = await apiCall(
            "GET",
            "dashboard/creater/getAllTestStatues",
            {},
            null,
            true
        );
        if( response?.data ) {
            setTestStatuses(response.data);
        }
    }
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
                                {testStatuses.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    }

                    {/* Date Range Filter */}
                    <Col md="2">
                        <Button variant="outline-secondary" onClick={() => setDateRangePopUpVisible(true)}>
                            📅 Date Range
                        </Button>
                    </Col>
                    <DateRangeFilter setStartDate= {setStartDate} setEndDate={setEndDate} show={dateRangePopUpVisible} onClose={()=>setDateRangePopUpVisible(false)}/>
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
                <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ➡️</Button>
            </div>
        </div>
    );
};

export default ListTest;
