import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

const DateRangeFilter = ({ setStartDate, setEndDate, show, onClose }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select a full date range.");
      return;
    }
    setStartDate(startDate);
    setEndDate(endDate);
    onClose(); // close modal after applying
  };

  return (
    <>
      {show && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Filter by Date Range</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <DatePicker
                  style={{ width: "70%" }}
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  className="form-control"
                  placeholderText="Click to select a date range"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleFilter}>Apply Filter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DateRangeFilter;
