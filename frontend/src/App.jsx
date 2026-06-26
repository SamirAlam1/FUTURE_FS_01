import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar from './components/public/Navbar';
import Footer from './components/public/Footer';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Public Pages
import Home       from './pages/public/Home';
import About      from './pages/public/About';
import Education  from './pages/public/Education';
import Skills     from './pages/public/Skills';
import Projects   from './pages/public/Projects';
// import Blog       from './pages/public/Blog';
// import BlogDetail from './pages/public/BlogDetail';
// import Gallery    from './pages/public/Gallery';
import Contact         from './pages/public/Contact';
import Certifications  from './pages/public/Certifications';

// Admin Pages
import AdminLogin  from './pages/admin/AdminLogin';
import Dashboard   from './pages/admin/Dashboard';
import { AdminProjectsList, AdminProjectForm }   from './pages/admin/AdminProjects';
import { AdminSkillsList,   AdminSkillForm }     from './pages/admin/AdminSkills';
import { AdminEducationList, AdminEducationForm } from './pages/admin/AdminEducation';
import { AdminCertificationsList, AdminCertificationForm } from './pages/admin/AdminCertifications';
// import { AdminBlogList,     AdminBlogForm }      from './pages/admin/AdminBlogs';
// import { AdminGalleryList,  AdminGalleryForm }   from './pages/admin/AdminGallery';
import AdminMessages from './pages/admin/AdminMessages';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/"          element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about"     element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/education" element={<PublicLayout><Education /></PublicLayout>} />
            <Route path="/skills"    element={<PublicLayout><Skills /></PublicLayout>} />
            <Route path="/projects"  element={<PublicLayout><Projects /></PublicLayout>} />
            {/* <Route path="/blog"      element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:id"  element={<PublicLayout><BlogDetail /></PublicLayout>} />
            <Route path="/gallery"   element={<PublicLayout><Gallery /></PublicLayout>} /> */}
            <Route path="/contact"          element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/certifications"   element={<PublicLayout><Certifications /></PublicLayout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard"        element={<Dashboard />} />
                <Route path="/admin/projects"         element={<AdminProjectsList />} />
                <Route path="/admin/projects/new"     element={<AdminProjectForm />} />
                <Route path="/admin/projects/edit/:id" element={<AdminProjectForm />} />
                <Route path="/admin/skills"           element={<AdminSkillsList />} />
                <Route path="/admin/skills/new"       element={<AdminSkillForm />} />
                <Route path="/admin/skills/edit/:id"  element={<AdminSkillForm />} />
                <Route path="/admin/education"           element={<AdminEducationList />} />
                <Route path="/admin/education/new"       element={<AdminEducationForm />} />
                <Route path="/admin/education/edit/:id"  element={<AdminEducationForm />} />
                <Route path="/admin/certifications"          element={<AdminCertificationsList />} />
                <Route path="/admin/certifications/new"      element={<AdminCertificationForm />} />
                <Route path="/admin/certifications/edit/:id" element={<AdminCertificationForm />} />
                {/* <Route path="/admin/blogs"            element={<AdminBlogList />} />
                <Route path="/admin/blogs/new"        element={<AdminBlogForm />} />
                <Route path="/admin/blogs/edit/:id"   element={<AdminBlogForm />} />
                <Route path="/admin/gallery"          element={<AdminGalleryList />} />
                <Route path="/admin/gallery/new"      element={<AdminGalleryForm />} />
                <Route path="/admin/gallery/edit/:id" element={<AdminGalleryForm />} /> */}
                <Route path="/admin/messages"         element={<AdminMessages />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <PublicLayout>
                <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
                  <p className="text-8xl mb-6">🔍</p>
                  <h1 className="text-4xl font-bold gradient-text mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
