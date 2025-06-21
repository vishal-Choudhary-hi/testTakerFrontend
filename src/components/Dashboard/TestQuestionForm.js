import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { FaTrash, FaEdit, FaPlus, FaSave } from "react-icons/fa";
import AIQuestionGenerationForm from "./AIQuestionGenerationForm";
import AIGeneratedQuestionForm from "./AIGeneratedQuestionForm";
import apiCall from "../../services/api";
import { useSearchParams } from "react-router-dom";
import Loading from "../Loading";
import { useReducedMotion } from "framer-motion";
import EditQuestionModal from "./EditQuestionModal";

const TestQuestionForm = ({ questions, updateQuestion, addQuestion, deleteQuestion, questionTypes }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editData, setEditData] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchParams] = useSearchParams();
    const [showAIQuestionModal,setShowAIQuestionModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aISuggestedQuestions,setAISuggestedQuestions]=useState(null);
    const [AIQuestionGenerationData,setAIQuestionGenerationData]=useState(null);
    const [alreadyFilledAIFormDetails,setAlreadyFilledAIFormDetails]=useState(null);
    const [showAIQuestionModalForm,setShowAIQuestionModalForm]=useState(false)
    const isMounted=useRef();
    const doNotChangeEditData=useRef();
    let previousLength = useRef();


    useEffect(()=>{
        if(isMounted.current)return;
        isMounted.current=true;
        getAIAlreadyRecommendedQuestions()
    },[])
    const getAIAlreadyRecommendedQuestions=async()=>{
        const urlSearchParams = new URLSearchParams(window.location.search);
        const response=await apiCall("GET", "dashboard/creater/getAISuggestedQuestions?testId="+urlSearchParams.get("testId"),null, null, true);
        setAISuggestedQuestions(response.data.ai_response);
        setAlreadyFilledAIFormDetails(response.data.creator_request);
    };

    const openEditModal = (idx) => {
        if(!doNotChangeEditData.current){
            setEditData({ ...questions[idx] });
        }
        setEditingIndex(idx);
        setErrors({});
    };

    const closeModal = (action = 'delete') => {
        if (action != 'delete' && !validate()) return;
        setEditingIndex(null);
        setEditData(null);
        setErrors({});
        doNotChangeEditData.current=false;
    };

    const validate = () => {
        const newErrors = {};
        if (!editData.question) newErrors.question = "Question is required";
        if (!editData.score) newErrors.score = "Score is required";
        if (!editData.questionTypeId) {
            newErrors.questionTypeId = "Question type is required";
        } else {
            const selectedType = questionTypes.find(t => t.id === editData.questionTypeId);
            if (selectedType && !selectedType.score_manually && selectedType.allow_options) {
                const options = editData.options || [];
                if (options.length < 2) {
                    newErrors.options = "At least 2 options are required";
                }
                if (!options.some(opt => (opt.isCorrect || opt.is_correct))) {
                    newErrors.correct = "At least one correct option must be selected";
                }
            } else if (!selectedType.allow_options && !selectedType.score_manually) {
                const options = editData.options || [];
                if (!options.some(opt => (opt.isCorrect || opt.is_correct))) {
                    newErrors.correct = "At least one correct option must be selected";
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveChanges = () => {
        if (!validate()) return;
        if (editingIndex !== null) {
            const transformedOptions = (editData.options || []).map(({ is_correct, ...opt }) => ({
            ...opt,
            isCorrect: opt.isCorrect ?? is_correct ?? false
            }));
            updateQuestion(editingIndex, 'question', editData.question);
            updateQuestion(editingIndex, 'score', parseInt(editData.score));
            updateQuestion(editingIndex, 'negativeMarks', isNaN(parseInt(editData.negativeMarks)) ? 0 : parseInt(editData.negativeMarks));
            updateQuestion(editingIndex, 'questionTypeId', parseInt(editData.questionTypeId));
            updateQuestion(editingIndex, 'options', transformedOptions);
        }
        closeModal();
    };

    useEffect(() => {
        if (questions.length > previousLength.current) {
            openEditModal(questions.length - 1);
        }
        previousLength.current = questions.length;
    }, [questions.length]);

    const handleOptionChange = (index, field, value) => {
        const selectedType = questionTypes.find(t => t.id === editData.questionTypeId);
        const multipleCorrect = selectedType?.allow_multiple_correct_answer;

        const updatedOptions = [...(editData.options || [])];

        if (field === 'isCorrect') {
            if (multipleCorrect) {
                updatedOptions[index] = { ...updatedOptions[index], isCorrect: value };
            } else {
                updatedOptions.forEach((opt, i) => {
                    updatedOptions[i] = { ...opt, isCorrect: i === index };
                });
            }
        } else {
            updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        }

        setEditData({ ...editData, options: updatedOptions });
    };

    const handleCorrectAnswer = (value) => {
        let options = [{
            isCorrect: true,
            description: value,
            image: null
        }];
        setEditData({ ...editData, options: options });

    }
    const addOption = () => {
        setEditData({
            ...editData,
            options: [...(editData.options || []), { description: '', isCorrect: false, image: '' }]
        });
    };

    const removeOption = (index) => {
        const updatedOptions = [...editData.options];
        updatedOptions.splice(index, 1);
        setEditData({ ...editData, options: updatedOptions });
    };

    const handleAIGenerateQuestions = async(questionData) => {
        setAIQuestionGenerationData(questionData);
        const urlSearchParams = new URLSearchParams(window.location.search);
        let testId = urlSearchParams.get("testId");
        const requestData = {
           testId,
            aiInstructions: questionData,
        }
        setLoading(true);
        await apiCall("POST", "dashboard/creater/getQuestionRecomendationFromAI", requestData, null, true);
        await getAIAlreadyRecommendedQuestions()
        setShowAIQuestionModalForm(false);

        setLoading(false);
        // setShowAIQuestionModal(false);
    }
    const handleAIQuestionIncluded=async(q)=>{
        doNotChangeEditData.current=true;
        addQuestion();
        setEditData({...q});
    }

    return (
        <div>
            {questions.map((q, idx) => {
                const selectedType = questionTypes.find(type => type.id === q.questionTypeId);

                return (
                    <div key={idx} className="border p-3 mb-4 rounded">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Question {idx + 1}:</strong> {q.question}
                                <div className="text-muted">Score: {q.score} | Negative Marks: {q.negativeMarks}</div>
                                <div className="text-muted">Type: {selectedType?.label}</div>
                            </div>
                            <div className="d-flex justify-content-between align-item-center" style={{ width: "30%" }}>
                                <Button variant="outline-primary" onClick={() => openEditModal(idx)}>
                                    <FaEdit title="Edit" />
                                </Button>
                                <Button variant="outline-danger" onClick={() => deleteQuestion(idx)}>
                                    <FaTrash title="Delete Question" />
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
            <button className="btn btn-primary" onClick={() => setShowAIQuestionModal(true)}>
                Open Question Generator
            </button>

            <Modal show={showAIQuestionModal} onHide={() => setShowAIQuestionModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>AI Question Generator</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        loading ? (
                            <Loading message="Generating Questions" />
                        ) : (
                            (!aISuggestedQuestions||showAIQuestionModalForm) ? (
                            <AIQuestionGenerationForm onSubmit={handleAIGenerateQuestions} alreadyFilledAIFormDetails={alreadyFilledAIFormDetails}/>
                            ):(
                                <AIGeneratedQuestionForm onChange={handleAIQuestionIncluded} aISuggestedQuestions={aISuggestedQuestions} generateAIQuestions={()=>handleAIGenerateQuestions(AIQuestionGenerationData)} setShowAIQuestionModalForm={()=>setShowAIQuestionModalForm(true)}/>
                            )
                        )
                    }
                </Modal.Body>
            </Modal>
            <div className="text-center mt-4">
                <Button variant="primary" onClick={addQuestion}><FaPlus /> Add Question</Button>
            </div>

            <EditQuestionModal
                editingIndex={editingIndex}
                editData={editData}
                errors={errors}
                questionTypes={questionTypes}
                closeModal={closeModal}
                deleteQuestion={deleteQuestion}
                saveChanges={saveChanges}
                handleCorrectAnswer={handleCorrectAnswer}
                addOption={addOption}
                removeOption={removeOption}
                handleOptionChange={handleOptionChange}
                setEditData={setEditData}
            />
        </div>
    );
};

export default TestQuestionForm;
