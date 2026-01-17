import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import enrollmentRequestRoutes from "./routes/enrollmentRequest.routes.js";
import courseApprovalRoutes from "./routes/courseApproval.routes.js";
import meRoutes from "./routes/me.routes.js";
import studentRoutes from "./routes/student.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
 
const app=express();
// app.use(cors()); 
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.options("*", cors());  
app.use(express.json());
app.use("/api/me", meRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/enrollment-requests", enrollmentRequestRoutes);
app.use("/api/course-approvals", courseApprovalRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req,res)=>{
    res.send("wadde bai");
});
app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`)
}) 