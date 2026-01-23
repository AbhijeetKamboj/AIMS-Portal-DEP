import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { apiFetch } from '../../services/api';

const CreateCourseCatalog = () => {
    const [formData, setFormData] = useState({
        course_code: '',
        course_name: '',
        credits: 0,
        department: '',
        l: 0, t: 0, p: 0, s: 0
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validation
        if (!formData.credits || formData.credits < 1) {
            setMessage({ type: 'error', text: 'Credits must be at least 1' });
            setLoading(false);
            return;
        }

        try {
            // Using apiFetch wrapper which handles base URL and Auth
            const response = await apiFetch('/courses/create', 'POST', formData);

            if (response.error) {
                setMessage({ type: 'error', text: response.error });
            } else {
                setMessage({ type: 'success', text: 'Course created successfully! Pending Admin Approval.' });
                setFormData({
                    course_code: '',
                    course_name: '',
                    credits: 0,
                    department: '',
                    l: 0, t: 0, p: 0, s: 0
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Course to Catalog</h2>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                        <input
                            type="text"
                            name="course_code"
                            value={formData.course_code}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. CS101"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. CSE"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                        type="text"
                        name="course_name"
                        value={formData.course_name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Introduction to Programming"
                    />
                </div>

                <div className="grid grid-cols-5 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                        <input type="number" name="credits" value={formData.credits} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">L</label>
                        <input type="number" name="l" value={formData.l} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">T</label>
                        <input type="number" name="t" value={formData.t} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">P</label>
                        <input type="number" name="p" value={formData.p} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">S</label>
                        <input type="number" name="s" value={formData.s} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Course'}
                </button>
            </form>
        </div>
    );
};

export default CreateCourseCatalog;
