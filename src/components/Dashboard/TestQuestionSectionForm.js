import React, { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";

import Loading from "../Loading";
import { useSnackbar } from "../../contexts/SnackbarContext";
import apiCall from "../../services/api";
import TestQuestionSection from "./TestQuestionSection";
import { FaPlus } from "react-icons/fa";

const TestQuestionSectionForm = ({ handleNext, prefilledData }) => {
    const isMounted = useRef(false);

    const newSectionStructure = {
        label: "",
        description: "",
        totalScore: 0,
        questions: []
    };
    const [loading, setLoading] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const { showSnackbar } = useSnackbar();

    const [questionTypes, setQuestionTypes] = useState([]);
    const [currentSectionValidationError, setCurrentSectionValidationError] = useState(null);
    const [questionSection, setQuestionSection] = useState(() => {
        if (prefilledData?.QuestionSection) {
            return prefilledData.QuestionSection.map((section) => ({
                totalScore: section.total_score,
                label: section.label,
                description: section.description,
                questions: section.Question.map((q) => ({
                    questionTypeId: q.type_id,
                    question: q.question,
                    image: q.image,
                    negativeMarks: q.negative_score_on_wrong_answer,
                    score: q.score_on_correct_answer,
                    manual_scoring: q.manual_scoring,
                    options: q.Options?.map((opt) => ({
                        description: opt.description,
                        image: opt.image,
                        isCorrect: opt.is_correct,
                    })) || [],
                }))
            }));
        } else {
            return [
                { ...newSectionStructure },
            ];
        }
    });

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;
        const fetchQuestionTypes = async () => {
            const questionTypesResponse = await apiCall(
                "GET",
                "dashboard/creater/getQuestionTypes",
                null,
                showSnackbar,
                true
            );
            setQuestionTypes(questionTypesResponse.data || []);
        };
        fetchQuestionTypes();
    }, [showSnackbar]);

    const updateSectionField = (index, field, value) => {
        const updated = [...questionSection];
        updated[index][field] = value;
        setQuestionSection(updated);
    };

    const handleSelectionChange = (type) => {
        if (!validateSection(currentSection)) return;
        setCurrentSectionIndex((prevIndex) =>
            type === "next"
                ? Math.min(prevIndex + 1, questionSection.length - 1)
                : Math.max(prevIndex - 1, 0)
        );
    };

    const handleAddSection = () => {
        if (!validateSection(currentSection)) return;

        setQuestionSection([...questionSection, newSectionStructure]);
        setCurrentSectionIndex(questionSection.length); // go to the new section
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        for (const section of questionSection) {
            if (!validateSection(section)) {
                setLoading(false);
                return;
            }
        }

        await handleNext({ sections: questionSection });
        setLoading(false);
    };

    const currentSection = questionSection[currentSectionIndex];

    const validateSection = (section) => {
        let error = {};
        let isValidated = true;
        if (!section.label || section.label.trim() === "") {
            error.label = "Section label is required.";
            isValidated = false;
        }

        if (!section.description || section.description.trim() === "") {
            error.description = "Section description is required.";
            isValidated = false;
        }

        if (!Array.isArray(section.questions) || section.questions.length === 0) {
            error.questions = "At least one question is required.";
            isValidated = false;
        }
        if (!isValidated) {
            setCurrentSectionValidationError({ ...error });
        } else {
            setCurrentSectionValidationError(null);
        }
        return isValidated;
    };
    return (
        <div>
            <h4 className="text-center mb-4">Test Question Sections</h4>
            <Form onSubmit={handleSubmit}>
                {currentSection && (
                    <TestQuestionSection
                        index={currentSectionIndex}
                        section={currentSection}
                        updateSectionField={updateSectionField}
                        questionTypes={questionTypes}
                        sectionValidationError={currentSectionValidationError}
                    />
                )}

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <Button
                        onClick={() => handleSelectionChange("previous")}
                        disabled={currentSectionIndex === 0}
                        variant="outline-primary"
                    >
                        ⬅️ Previous Section
                    </Button>
                    <div>
                        {currentSectionIndex + 1}/{questionSection.length}
                    </div>
                    <Button
                        onClick={() => handleSelectionChange("next")}
                        disabled={currentSectionIndex === questionSection.length - 1}
                        variant="outline-primary"
                    >
                        Next Section ➡️
                    </Button>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <Button
                        onClick={handleAddSection}
                        variant="success"
                        style={{ width: "50%" }}
                    >
                        <FaPlus /> Add New Section
                    </Button>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <Button
                        type="submit"
                        style={{ width: "70%", height: "40px" }}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loading message="Saving Test" type="primaryButton" />
                        ) : (
                            "Save And Next ➡️"
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default TestQuestionSectionForm;
