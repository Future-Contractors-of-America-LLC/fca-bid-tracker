import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './public/Home';
import Platform from './public/Platform';
import Academy from './public/Academy';
import Auricrux from './public/Auricrux';
import Pricing from './public/Pricing';
import Contact from './public/Contact';
import Login from './entry/Login';
import Portal from './entry/Portal';
import Messages from './portal/Messages';
import Notifications from './portal/Notifications';
import Projects from './portal/Projects';
import Files from './portal/Files';
import AcademyPortal from './portal/Academy';
import Finance from './portal/Finance';
import Admin from './portal/Admin';
import NavigationBar from '../ui/NavigationBar';
import AuricruxDockPanel from '../ui/AuricruxDock';

export default function AppRouter() {
  return (
    <Router>
      <NavigationBar />
      <AuricruxDockPanel />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/auricrux" element={<Auricrux />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/portal/messages" element={<Messages />} />
        <Route path="/portal/notifications" element={<Notifications />} />
        <Route path="/portal/projects" element={<Projects />} />
        <Route path="/portal/files" element={<Files />} />
        <Route path="/portal/academy" element={<AcademyPortal />} />
        <Route path="/portal/finance" element={<Finance />} />
        <Route path="/portal/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
