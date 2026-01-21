import Navbar from "../../components/Navbar.jsx";
import CreateUser from "./CreateUser.jsx";
import UploadGrades from "./UploadGrades.jsx";
import LockSemester from "./LockSemester.jsx";
import CreateCourse from "./CreateCourse.jsx";
import ApproveOfferings from "./ApproveOfferings.jsx";
import ManageDepartments from "./ManageDepartments.jsx";
import AssignAdvisor from "./AssignAdvisor.jsx";
import StudentGrading from "./StudentGrading.jsx";

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Admin Dashboard" />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: User Management */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 uppercase tracking-wider">User Management</h2>
                            <CreateUser />
                            <div className="mt-8">
                                <AssignAdvisor />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 uppercase tracking-wider">Student Grading</h2>
                            <StudentGrading />
                        </section>
                    </div>

                    {/* Right Column: Academic Operations */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 uppercase tracking-wider">Academic Operations</h2>
                            <ManageDepartments />
                            <div className="mt-8">
                                <CreateCourse />
                            </div>
                            <ApproveOfferings />
                            <div className="mt-8">
                                <UploadGrades />
                            </div>
                            <div className="mt-8">
                                <LockSemester />
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
