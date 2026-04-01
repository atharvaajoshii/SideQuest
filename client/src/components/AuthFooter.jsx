import { Link } from 'react-router-dom';
import { Shield, Mail, Github, Twitter, Instagram } from 'lucide-react';

export default function AuthFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary to-indigo-600 rounded-xl">
                <Shield size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                SideQuest<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              The trusted platform for students to collaborate, complete tasks, and earn money.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <Twitter size={18} className="text-slate-400 hover:text-white" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <Github size={18} className="text-slate-400 hover:text-white" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <Instagram size={18} className="text-slate-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-primary transition-colors">Browse Tasks</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-primary transition-colors">Safety Tips</Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-primary transition-colors">Community Guidelines</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-primary" />
              <div>
                <p className="text-white font-medium text-sm">Stay updated</p>
                <p className="text-xs text-slate-500">Get the latest SideQuest news and updates</p>
              </div>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-slate-900 font-bold text-sm rounded-lg hover:from-primary hover:to-indigo-500 transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} SideQuest. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Built with ❤️ for students, by students
          </p>
        </div>
      </div>
    </footer>
  );
}
