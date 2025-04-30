'use client';

import { Button } from "../components/ui/Button";
import { ArrowRight, Baby, Bell, Calendar, LineChart, Heart, Shield, Stethoscope, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { useState } from "react";

const features = [
  {
    icon: Heart,
    title: "Real-time Monitoring",
    description: "Continuous tracking of vital signs and health metrics through connected wearables"
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Advanced ML algorithms for early detection of potential complications"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Instant notifications for both mothers and healthcare providers"
  },
  {
    icon: LineChart,
    title: "Comprehensive Analytics",
    description: "Detailed reports and insights for informed decision-making"
  }
];

const timeline = [
  {
    title: "Connect",
    description: "Link your wearable devices and complete your health profile"
  },
  {
    title: "Monitor",
    description: "Track your vital signs and health metrics in real-time"
  },
  {
    title: "Analyze",
    description: "Receive personalized insights and risk assessments"
  },
  {
    title: "Act",
    description: "Get timely alerts and recommendations for optimal care"
  }
];

export default function Home() {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-slate-50">
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo */}
      <div className="flex items-center">
        <Baby className="h-8 w-8 text-slate-600" />
        <span className="ml-2 text-xl font-semibold text-slate-800">MaternalCare</span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-8">
        <a href="#features" className="text-slate-600 hover:text-slate-900">Features</a>
        <a href="#how-it-works" className="text-slate-600 hover:text-slate-900">How it Works</a>
        <a href="#testimonials" className="text-slate-600 hover:text-slate-900">Testimonials</a>
        <Link to="/login">
          <Button variant="outline" className="ml-4">Sign In</Button>
        </Link>
        <Button className="bg-slate-600 hover:bg-slate-700">Get Started</Button>
      </div>

      {/* Mobile Toggle Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-700 focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </div>
  </div>

  {/* Mobile Menu */}
  {isOpen && (
    <div className="md:hidden bg-white px-4 pt-4 pb-6 space-y-4 border-t shadow">
      <a href="#features" className="block text-slate-700 hover:text-slate-900">Features</a>
      <a href="#how-it-works" className="block text-slate-700 hover:text-slate-900">How it Works</a>
      <a href="#testimonials" className="block text-slate-700 hover:text-slate-900">Testimonials</a>
      <Link to="/login">
        <Button variant="outline" className="w-full">Sign In</Button>
      </Link>
      <Button className="w-full">Get Started</Button>
    </div>
  )}
</nav>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Empowering Maternal Health Through Technology
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Advanced monitoring and personalized care for every stage of your pregnancy journey
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-slate-600 hover:bg-slate-700">
                Start Monitoring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Monitoring Features</h2>
            <p className="text-lg text-slate-600">Everything you need for a healthy pregnancy journey</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <feature.icon className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Simple steps to start your monitoring journey</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {timeline.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-300 ml-4" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-600">Real experiences from mothers and healthcare providers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-slate-50"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&w=100&h=100`}
                    alt="User"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-slate-900">Ruth Chiwawa</h4>
                    <p className="text-slate-600">Expectant Mother</p>
                  </div>
                </div>
                <p className="text-slate-700">
                  "This platform has given me peace of mind throughout my pregnancy. The real-time monitoring and instant alerts are invaluable."
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
       <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Baby className="h-8 w-8" />
                <span className="ml-2 text-xl font-semibold">MaternalCare</span>
              </div>
              <p className="text-slate-400">
                Empowering maternal health through advanced monitoring and care.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white">Features</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white">About</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white">Careers</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white">Terms</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white">HIPAA</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2025 MaternalCare. All rights reserved.</p>
          </div>
        </div>
      </footer> 
    </div>
  );
}