import { Link } from 'react-router-dom';
import { Shield, Users, Zap, Target, Heart, Globe } from 'lucide-react';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';

export default function About() {
  const team = [
    { name: 'Atmika Nayak', role: 'Founder & CEO', emoji: '👩‍💼' },
  ];

  const values = [
    { icon: <Target size={32} />, title: 'Our Mission', description: 'To empower students by creating opportunities for skill development through real-world tasks and peer collaboration.' },
    { icon: <Heart size={32} />, title: 'Our Vision', description: 'A campus community where every student can learn, earn, and grow together through meaningful collaborations.' },
    { icon: <Shield size={32} />, title: 'Our Values', description: 'Trust, transparency, and student-first approach guide every decision we make on this platform.' },
  ];

  const stats = [
    { number: '500+', label: 'Students' },
    { number: '1000+', label: 'Tasks Completed' },
    { number: '₹50K+', label: 'Earned by Students' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Shield size={64} className="text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">About SideQuest</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for students, by students. We're on a mission to transform how students collaborate and earn.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                  <div className="w-14 h-14 bg-indigo-100 text-primary rounded-xl flex items-center justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <p className="text-slate-700 mb-4">
                SideQuest was born from a simple observation: students have skills, and students need help.
                Why not create a platform where they can meet?
              </p>
              <p className="text-slate-700 mb-4">
                Whether it's debugging code, designing a logo, writing content, or creating presentations,
                every task is an opportunity to learn and earn. We've created a safe, student-only community
                where you can post tasks, find helpers, and build your portfolio.
              </p>
              <p className="text-slate-700">
                Our platform ensures secure transactions through our wallet system, maintains quality through
                our rating system, and keeps everyone safe through our reporting and admin review processes.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose SideQuest?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Student Community</h3>
                <p className="text-slate-600">Verified student accounts ensure a safe, peer-to-peer environment.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Quick & Easy</h3>
                <p className="text-slate-600">Post a task in minutes, get responses quickly, and get it done.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Build Portfolio</h3>
                <p className="text-slate-600">Every completed task adds to your profile and helps your career.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-indigo-100 mb-8">Join hundreds of students already earning and learning on SideQuest.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        <AuthFooter />
      </div>
    </>
  );
}
