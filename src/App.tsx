import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound.tsx";
import { CertificateVerificationPage, PublicMemberPage } from "./pages/PublicIdentityPages.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import PageLoader from "./components/devqueens/PageLoader.tsx";

const Index = lazy(() => import("./pages/Index.tsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.tsx"));
const MemberPortal = lazy(() => import("./pages/MemberPortal.tsx"));
const AdminPortal = lazy(() => import("./pages/AdminPortal.tsx"));
const CourseWorkspace = lazy(() => import("./pages/CoursePages.tsx").then((module) => ({ default: module.CourseWorkspace })));
const PublicCoursePage = lazy(() => import("./pages/PublicCoursePage.tsx"));

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/portal/*" element={<MemberPortal />} />
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/courses/:slug" element={<CourseWorkspace />} />
          <Route path="/learn/:slug" element={<PublicCoursePage />} />
          <Route path="/members/:memberId" element={<PublicMemberPage />} />
          <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
