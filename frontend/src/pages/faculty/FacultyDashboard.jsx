import Navbar from "../../components/Navbar.jsx";
import OfferCourse from "./OfferCourse.jsx";
import DirectEnroll from "./DirectEnroll.jsx";
import FacultyApprovals from "./FacultyApprovals.jsx";
import AdvisorApprovals from "./AdvisorApprovals.jsx";

export default function FacultyDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Faculty Dashboard" />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Enrollment Actions */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 uppercase tracking-wider">Course Management</h2>
                            <OfferCourse />
                            <div className="mt-8">
                                <DirectEnroll />
                            </div>
                        </section>
                    </div>

                    {/* Right: Approvals */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 uppercase tracking-wider">Approvals</h2>
                            <AdvisorApprovals />
                            <FacultyApprovals />
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
