import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tutor from "./pages/Tutor";
import Courses from "./pages/Courses";
import Certificate from "./pages/Certificate";
import AdminDashboard from "./pages/AdminDashboard";
import DomainCourses from "./pages/DomainCourses";
import CourseDetail from "./pages/CourseDetail";
import Reader from "./pages/Reader";
import QuizList from "./pages/QuizList";
import Quiz from "./pages/Quiz";
import AiLabSelect from "./pages/AiLabSelect";
import AiLab from "./pages/AiLab";
import VisualisationSelect from "./pages/VisualisationSelect";
import VisualisationDetail from "./pages/VisualisationDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminPaths from "./pages/AdminPaths";
import AdminLessons from "./pages/AdminLessons";
import AdminQuizManagement from "./pages/AdminQuizManagement";
import AdminCertificates from "./pages/AdminCertificates";
import AdminStats from "./pages/AdminStats";
import AdminRoute from "./components/AdminRoute";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";
import Favoris from "./pages/Favoris";
import Historique from "./pages/Historique";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:domainId" element={<DomainCourses />} />
        <Route path="/courses/:domainId/:courseId" element={<CourseDetail />} />
        <Route path="/learn/:domainId/:courseId" element={<Reader />} />
        <Route path="/quiz" element={<QuizList />} />
        <Route path="/quiz/:domainId" element={<Quiz />} />
        <Route path="/ai-lab" element={<AiLabSelect />} />
        <Route path="/ai-lab/:domainId" element={<AiLab />} />
        <Route path="/visualisation" element={<VisualisationSelect />} />
        <Route path="/visualisation/:domainId" element={<VisualisationDetail />} />
        <Route path="/certificate/:certificatId" element={<Certificate />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/paths" element={<AdminRoute><AdminPaths /></AdminRoute>} />
        <Route path="/admin/lessons" element={<AdminRoute><AdminLessons /></AdminRoute>} />
        <Route path="/admin/quiz" element={<AdminRoute><AdminQuizManagement /></AdminRoute>} />
        <Route path="/admin/certificates" element={<AdminRoute><AdminCertificates /></AdminRoute>} />
        <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
