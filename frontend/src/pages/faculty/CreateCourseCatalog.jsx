import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { apiFetch } from '../../services/api';
import toast from 'react-hot-toast';

const CreateCourseCatalog = () => {
    const [formData, setFormData] = useState({
        course_code: '',
        course_name: '',
        credits: 0,
        department: '',
        l: 0, t: 0, p: 0, s: 0
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: ['l', 't', 'p', 's', 'credits'].includes(name) ? parseInt(value) || 0 : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!formData.course_code.trim()) {
            toast.error('Course code is required');
            setLoading(false);
            return;
        }
        if (!formData.course_name.trim()) {
            toast.error('Course name is required');
            setLoading(false);
            return;
        }
        if (!formData.department.trim()) {
            toast.error('Department is required');
            setLoading(false);
            return;
        }
        if (!formData.credits || formData.credits < 1) {
            toast.error('Credits must be at least 1');
            setLoading(false);
            return;
        }

        try {
            const response = await apiFetch('/courses/create', 'POST', formData);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Course created successfully! Pending Admin Approval.');
                setFormData({
                    course_code: '',
                    course_name: '',
                    credits: 0,
                    department: '',
                    l: 0, t: 0, p: 0, s: 0
                });
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Add Course to Catalog</h2>
                <p className="text-gray-600 mt-2">Create a new course that will be available for offering next semester. Courses require admin approval before becoming active.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-900">Course Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Fill in the course details below</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Course Code and Department Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Course Code</label>
                            <input
                                type="text"
                                name="course_code"
                                value={formData.course_code}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                placeholder="e.g. CS305"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                placeholder="e.g. CSE, EEE, ME"
                            />
                        </div>
                    </div>

                    {/* Course Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Course Name</label>
                        <input
                            type="text"
                            name="course_name"
                            value={formData.course_name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                            placeholder="e.g. Software Engineering"
                        />
                    </div>

                    {/* Credits and L-T-P-S */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Course Structure</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-2">Credits</label>
                                <input 
                                    type="number" 
                                    name="credits" 
                                    min="0"
                                    max="12"
                                    value={formData.credits} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center font-semibold" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2 text-center">Lecture</label>
                                <input 
                                    type="number" 
                                    name="l" 
                                    min="0"
                                    max="6"
                                    value={formData.l} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center font-semibold" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2 text-center">Tutorial</label>
                                <input 
                                    type="number" 
                                    name="t" 
                                    min="0"
                                    max="6"
                                    value={formData.t} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center font-semibold" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2 text-center">Practical</label>
                                <input 
                                    type="number" 
                                    name="p" 
                                    min="0"
                                    max="6"
                                    value={formData.p} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center font-semibold" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2 text-center">Self Study</label>
                                <input 
                                    type="number" 
                                    name="s" 
                                    min="0"
                                    max="6"
                                    value={formData.s} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center font-semibold" 
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">L-T-P-S represents Lecture-Tutorial-Practical-Self Study hours per week</p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">Note:</span> Your course will be submitted for admin approval. Once approved, it will be available for offering in the next semester.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-black text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium"
                        >
                            {loading ? 'Creating Course...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourseCatalog;
