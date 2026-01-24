import React, { useState, useEffect } from 'react';
import { apiFetch } from "../../services/api";

const GradeUploadModal = ({ offering, onClose }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [manualEntry, setManualEntry] = useState({ roll_number: '', grade: '' });

    // File Handler
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const parseCSV = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const rows = text.trim().split('\n');
                // Assume Header: Roll, Grade
                // Skip header if needed or weak check
                // Let's assume First row is header if contains "Roll"
                const data = [];
                let startIndex = 0;
                if (rows[0].toLowerCase().includes('roll')) startIndex = 1;

                for (let i = startIndex; i < rows.length; i++) {
                    const cols = rows[i].split(',');
                    if (cols.length >= 2) {
                        data.push({
                            roll_number: cols[0].trim(),
                            grade: cols[1].trim()
                        });
                    }
                }
                resolve(data);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const handleBulkUpload = async () => {
        if (!file) return;
        setLoading(true);
        setMessage(null);

        try {
            const grades = await parseCSV(file);
            if (grades.length === 0) throw new Error("No valid data found in CSV");

            const res = await apiFetch("/faculty/upload-grades", "POST", {
                offering_id: offering.id,
                grades
            });

            if (res.error) throw new Error(res.error);

            setMessage({ type: 'success', text: `Uploaded! Success: ${res.results.success}, Failed: ${res.results.failed}` });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await apiFetch("/faculty/upload-grades", "POST", {
                offering_id: offering.id,
                grades: [{ roll_number: manualEntry.roll_number, grade: manualEntry.grade }] // Re-using bulk endpoint for single entry for consistency
            });

            if (res.error) throw new Error(res.error);

            if (res.results.failed > 0) {
                throw new Error(res.results.errors[0].error);
            }

            setMessage({ type: 'success', text: "Grade submitted successfully (Pending Approval)" });
            setManualEntry({ roll_number: '', grade: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Upload Grades</h2>
                        <p className="text-sm text-gray-500">{offering.courses.course_code}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-red-500 transition cursor-pointer">&times;</button>
                </div>

                <div className="p-8 space-y-8">
                    {message && (
                        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Manual Entry */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Single Entry</h3>
                        <form onSubmit={handleManualSubmit} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Roll Number</label>
                                <input
                                    type="text"
                                    value={manualEntry.roll_number}
                                    onChange={e => setManualEntry({ ...manualEntry, roll_number: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grade</label>
                                <input
                                    type="text"
                                    value={manualEntry.grade}
                                    onChange={e => setManualEntry({ ...manualEntry, grade: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </form>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Bulk Upload */}
                    <div>
                        <h3 className="text-lg font-bold mb-2">Bulk Upload (CSV)</h3>
                        <p className="text-sm text-gray-500 mb-4">Upload a CSV file with columns: Roll Number, Grade</p>

                        <div className="flex gap-4 items-center">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            <button
                                onClick={handleBulkUpload}
                                disabled={!file || loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Uploading...' : 'Upload CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradeUploadModal;
