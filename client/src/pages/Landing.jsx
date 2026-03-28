import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Briefcase, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

export default function Landing() {
  const dummyQuests = [
    { title: "Design a Logo for Tech Club", price: "₹500", tag: "Design" },
    { title: "Debug React Assignment", price: "₹300", tag: "Coding" },
    { title: "Write a 500-word Blog", price: "₹250", tag: "Writing" },
    { title: "Create a PowerPoint", price: "₹400", tag: "Presentation" },
    { title: "Video Editing for Reel", price: "₹600", tag: "Video" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-sm">
        <div className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>⚔️ SideQuest</span>
        </div>
        <div className="flex gap-4">
          <Link to="/signin" className="px-5 py-2 font-medium text-slate-600 hover:text-primary transition">
            Log In
          </Link>
          <Link to="/signup" className="px-5 py-2 font-medium bg-primary text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 flex flex-col items-center text-center px-4 bg-grid-pattern">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 text-primary font-semibold text-sm border border-indigo-100">
          🚀 Built for Students, By Students
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-dark max-w-4xl leading-tight tracking-tight">
          Complete Tasks. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
            Earn Your Stipend.
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          SideQuest is the ultimate campus marketplace. Post small jobs, pick up freelance gigs, and build your skills while earning extra pocket money.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link to="/signup" className="flex items-center gap-2 px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-300">
            Start Earning Now <ArrowRight size={20} />
          </Link>
          <Link to="/search" className="px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm">
            Browse Quests
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 bg-indigo-100 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Fair Compensation</h3>
            <p className="text-slate-500">Direct peer-to-peer payments. Negotiate rates that work for both of you.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 bg-green-100 text-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Build Your Portfolio</h3>
            <p className="text-slate-500">Every task you complete adds to your freelancer profile and rating.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Verified</h3>
            <p className="text-slate-500">Student-only community with a robust reporting and admin review system.</p>
          </div>
        </div>
      </section>

      {/* Carousel Section: Live Quests */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending SideQuests 🔥</h2>
          <p className="text-slate-400">Jump in and grab these opportunities before they're gone.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="pb-12"
          >
            {dummyQuests.map((quest, index) => (
              <SwiperSlide key={index}>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-primary transition cursor-pointer h-full flex flex-col">
                  <span className="text-xs font-bold text-primary bg-indigo-900/50 px-3 py-1 rounded-full w-max mb-4">
                    {quest.tag}
                  </span>
                  <h3 className="text-lg font-bold mb-2 flex-grow">{quest.title}</h3>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
                    <span className="text-secondary font-bold text-xl">{quest.price}</span>
                    <button className="text-sm bg-white text-dark font-bold px-4 py-1.5 rounded-lg hover:bg-slate-200 transition">
                      View
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-slate-400 py-8 text-center border-t border-slate-800">
        <p>© 2026 SideQuest. Built for students.</p>
      </footer>
    </div>
  );
}