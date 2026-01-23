export default function StudentDocuments() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Student Documents</h3>
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-12 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-soft text-gray-300 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">No Documents Available</h4>
                <p className="text-gray-500 max-w-sm mx-auto">Check back later for course materials, transcripts, and administrative documents.</p>
            </div>
        </div>
    );
}
