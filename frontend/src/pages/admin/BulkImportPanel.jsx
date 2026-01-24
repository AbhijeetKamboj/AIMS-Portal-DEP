import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function BulkImportPanel({ onPreview, onImport, expectedFields, dataType }) {
    const [importMethod, setImportMethod] = useState("csv-upload");
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const csvFileInputRef = useRef(null);
    const jsonFileInputRef = useRef(null);

    const parseCSV = (text) => {
        const lines = text.trim().split("\n");
        if (lines.length === 0) return [];

        const headers = lines[0].split(",").map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(",").map(p => p.trim());
            if (parts.length === 0 || !parts[0]) continue;

            const row = {};
            headers.forEach((header, idx) => {
                row[header] = parts[idx] || "";
            });
            data.push(row);
        }
        return data;
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                const data = parseCSV(text);
                if (data.length === 0) {
                    toast.error("No valid data found in CSV");
                    setPreview(null);
                    return;
                }
                setPreview({ data, method: "csv" });
                toast.success(`Parsed ${data.length} rows from CSV`);
            } catch (err) {
                toast.error("Error reading CSV: " + err.message);
                setPreview(null);
            }
        };
        reader.readAsText(file);
    };

    const handleJSONUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                const data = JSON.parse(text);
                const dataArray = Array.isArray(data) ? data : [data];
                if (dataArray.length === 0) {
                    toast.error("No data found in JSON");
                    setPreview(null);
                    return;
                }
                setPreview({ data: dataArray, method: "json" });
                toast.success(`Parsed ${dataArray.length} records from JSON`);
            } catch (err) {
                toast.error("Error parsing JSON: " + err.message);
                setPreview(null);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!preview) {
            toast.error("No data to import");
            return;
        }

        setLoading(true);
        try {
            await onImport(preview.data);
            setPreview(null);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Method Selection */}
            <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl w-fit">
                <button
                    onClick={() => setImportMethod("csv-upload")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                        importMethod === "csv-upload"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Upload CSV
                </button>
                <button
                    onClick={() => setImportMethod("json-upload")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                        importMethod === "json-upload"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Upload JSON
                </button>
            </div>

            {/* Main Layout: Upload on Left, Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-4">
                    {importMethod === "csv-upload" && (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-black transition-all cursor-pointer"
                            onClick={() => csvFileInputRef.current?.click()}
                        >
                            <p className="text-gray-600 font-medium text-lg">Click to upload CSV file</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Expected columns: {expectedFields.join(", ")}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Maximum file size: 50MB</p>
                        </div>
                    )}
                    {importMethod === "json-upload" && (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-black transition-all cursor-pointer"
                            onClick={() => jsonFileInputRef.current?.click()}
                        >
                            <p className="text-gray-600 font-medium text-lg">Click to upload JSON file</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Array of objects with {expectedFields.join(", ")} fields
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Maximum file size: 50MB</p>
                        </div>
                    )}

                    <input
                        ref={csvFileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                    />
                    <input
                        ref={jsonFileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleJSONUpload}
                        className="hidden"
                    />

                    {/* Action Buttons */}
                    {preview && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (importMethod === "csv-upload") {
                                        csvFileInputRef.current?.click();
                                    } else {
                                        jsonFileInputRef.current?.click();
                                    }
                                }}
                                className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Upload Different File
                            </button>
                            <button
                                onClick={() => setPreview(null)}
                                className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {preview && (
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-all"
                        >
                            {loading ? "Importing..." : `Import ${preview.data.length} Records`}
                        </button>
                    )}
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                    {!preview ? (
                        <div className="border border-gray-200 rounded-xl p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="mb-3">
                                <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-semibold">Data preview</p>
                            <p className="text-xs text-gray-500 mt-2">Upload a CSV or JSON file to preview the data here</p>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-blue-900">📊 Preview ({preview.data.length} records)</h4>
                                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                    {preview.method.toUpperCase()}
                                </span>
                            </div>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0">
                                        <tr className="bg-blue-100">
                                            {Object.keys(preview.data[0] || {}).map((key) => (
                                                <th key={key} className="px-3 py-2 text-left font-bold text-blue-900 whitespace-nowrap">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.data.map((row, idx) => (
                                            <tr key={idx} className="border-t border-blue-200 hover:bg-blue-100 transition-colors">
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="px-3 py-2 text-blue-900 text-xs truncate max-w-xs" title={String(val)}>
                                                        {String(val).substring(0, 50)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
