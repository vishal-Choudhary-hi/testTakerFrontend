import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import apiCall from '../../services/api';


const AIQuestionGenerationForm = ({ testId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    questionTypes: [],
    topics: [],
    difficultyLevels: [],
    subjects: []
  });
  const [questionTypes,setQuestionTypes]=useState([]);
  const [tagInputs, setTagInputs] = useState({
    topics: '',
    difficultyLevels: '',
    subjects: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchQuestionTypes = async () => {
        const response = await apiCall(
            "GET",
            "dashboard/creater/getQuestionTypes",
            null,
            null,
            true
        );
        if (response?.data) {
            setQuestionTypes(response.data);
        }
    }
    fetchQuestionTypes();
},[])
  const addTag = (field) => {
    const input = tagInputs[field].trim();
    if (input && !formData[field].includes(input)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], input]
      }));
    }
    setTagInputs(prev => ({ ...prev, [field]: '' }));
  };
  const removeTag = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCheckboxChange = (id, label, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, { id, label, count: '' }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        questionTypes: prev.questionTypes.filter(q => q.id !== id)
      }));
    }
  };

  const handleCountChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.map(q =>
        q.id === id ? { ...q, count: value } : q
      )
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (formData.questionTypes.length === 0) newErrors.questionTypes = 'At least one question type is required';

    formData.questionTypes.forEach(q => {
      if (!q.count || isNaN(q.count) || q.count <= 0) {
        newErrors[`count_${q.id}`] = 'Enter a valid number';
      }
    });

    ['topics', 'difficultyLevels', 'subjects'].forEach(field => {
      if (formData[field].length === 0) {
        newErrors[field] = `At least one ${field} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      purpose: formData.purpose,
      questionTypes: formData.questionTypes.map(q => ({
        questionTypeId: q.id,
        questionCount: parseInt(q.count)
      })),
      topics: formData.topics,
      difficultyLevels: formData.difficultyLevels,
      subjects: formData.subjects
    };

    onSubmit?.(payload);
    onClose?.();
  };

  return (
    <div>
        <form onSubmit={handleSubmit} noValidate className="px-2">
          <div className="mb-3">
            <label className="form-label">Purpose</label>
            <input
              type="text"
              className={`form-control ${errors.purpose ? 'is-invalid' : ''}`}
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="E.g. Generate practice questions for algebra"
            />
            <div className="invalid-feedback">{errors.purpose}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Question Types</label>
            {questionTypes.map(q => {
              const selected = formData.questionTypes.find(t => t.id === q.id);
              return (
                <div className="form-check d-flex align-items-center mb-2" key={q.id}>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id={`qtype-${q.id}`}
                    checked={!!selected}
                    onChange={e => handleCheckboxChange(q.id, q.label, e.target.checked)}
                  />
                  <label className="form-check-label me-2" htmlFor={`qtype-${q.id}`}>
                    {q.label}
                  </label>
                  {selected && (
                    <input
                      type="number"
                      min="1"
                      placeholder="Count"
                      className={`form-control w-auto ms-auto ${errors[`count_${q.id}`] ? 'is-invalid' : ''}`}
                      value={selected.count}
                      onChange={e => handleCountChange(q.id, e.target.value)}
                    />
                  )}
                  {errors[`count_${q.id}`] && (
                    <div className="invalid-feedback d-block">{errors[`count_${q.id}`]}</div>
                  )}
                </div>
              );
            })}
            {errors.questionTypes && <div className="text-danger">{errors.questionTypes}</div>}
          </div>

          {['topics', 'difficultyLevels', 'subjects'].map(field => (
            <div className="mb-3" key={field}>
              <label className="form-label text-capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <div className="d-flex flex-wrap align-items-center border rounded p-2">
                {formData[field].map((item, idx) => (
                  <span className="badge bg-primary me-2 mb-2 d-flex align-items-center" key={idx}>
                    {item}
                    <button
                      type="button"
                      className="btn-close btn-close-white btn-sm ms-2"
                      onClick={() => removeTag(field, idx)}
                    />
                  </span>
                ))}
                <input
                  type="text"
                  className={`form-control border-0 flex-grow-1 ${errors[field] ? 'is-invalid' : ''}`}
                  placeholder={`Add ${field} and press Enter`}
                  value={tagInputs[field]}
                  onChange={e => setTagInputs(prev => ({ ...prev, [field]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field))}
                />
              </div>
              {errors[field] && <div className="text-danger mt-1">{errors[field]}</div>}
            </div>
          ))}
        </form>
        <div className='d-flex justify-content-between mt-3'>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Generate Prompt
        </Button>
        </div>
    </div>
  );
};

export default AIQuestionGenerationForm;
