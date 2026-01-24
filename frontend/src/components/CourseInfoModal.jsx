import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const CourseInfoModal = ({ course, onClose }) => {
    if (!course) return null;

    const [courseDetails, setCourseDetails] = useState(null);
    const [enrollmentCount, setEnrollmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseData();
    }, [course?.id, course?.courses?.id]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            // Try to get course ID from different possible locations
            const courseId = course?.courses?.id || course?.id;
            
            if (courseId) {
                const res = await apiFetch(`/courses/${courseId}`);
                if (!res.error) {
                    setCourseDetails(res);
                }
            }

            // Fetch enrollment count for this offering
            const offeringId = course?.id; // course_offerings.id when called from faculty
            if (offeringId) {
                try {
                    const enrollmentsResponse = await apiFetch(`/courses/enrollments?offering_id=${offeringId}`);
                    setEnrollmentCount(enrollmentsResponse?.length || 0);
                } catch (enrollmentErr) {
                    console.log('Could not fetch enrollment count:', enrollmentErr);
                    setEnrollmentCount(0);
                }
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Use fetched details if available, otherwise fall back to passed course data
    const data = courseDetails || course;

    // Map data fields depending on source (offering, enrollment, or transcript)
    // If courseDetails was fetched, it's a flat course object; otherwise it's from course offering with nested courses
    const courseCode = data.course_code || data.courses?.course_code || data.code || 'N/A';
    const courseName = data.course_name || data.courses?.course_name || data.name || 'N/A';
    const credits = data.credits || data.courses?.credits || 'N/A';
    
    // L-T-P-S fields - fetch from multiple possible locations
    const lecture = data.l || data.courses?.l || data.lecture || 0;
    const tutorial = data.t || data.courses?.t || data.tutorial || 0;
    const practical = data.p || data.courses?.p || data.practical || 0;
    const selfStudy = data.s || data.courses?.s || data.self_study || 0;
    const ltps = `${lecture}-${tutorial}-${practical}-${selfStudy}`;
    
    // Instructor/Faculty name - get from offering since it has the faculty relationship
    const instructorName = course.faculty?.users?.name || 'N/A';
    
    // Semester/Academic Session
    const semester = data.semesters?.name || course.semesters?.name || 'N/A';

    // Seven core fields as specified by user
    const details = [
        { label: 'Course Code', value: courseCode },
        { label: 'Course Title', value: courseName },
        { label: 'Credits', value: credits },
        { label: 'L-T-P-S', value: ltps },
        { label: 'Professor', value: instructorName },
        { label: 'Semester', value: semester },
        { label: 'Enrolled Students', value: enrollmentCount }
    ];

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex items-center justify-center min-h-[300px]">
                    <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header with gradient */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-indigo-50 to-white">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{courseCode}</h2>
                        <p className="text-sm text-gray-600 mt-1">Course Details</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content - 7 Core Fields */}
                <div className="px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-4">
                        {details.map((detail, idx) => (
                            <div key={idx} className="flex flex-col p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {detail.label}
                                </p>
                                <p className="text-base font-semibold text-gray-900 break-words">
                                    {detail.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseInfoModal;
