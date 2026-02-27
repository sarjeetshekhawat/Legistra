import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon, ChartBarIcon, LightningBoltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Landing() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Law Student',
      text: 'Legistra helped me analyze 50+ contracts in hours instead of weeks. The risk detection is incredibly accurate.',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Johnson',
      role: 'Corporate Attorney',
      text: 'The AI insights are precise and save us substantial billable hours on contract review.',
      avatar: '👨‍⚖️'
    },
    {
      name: 'Priya Patel',
      role: 'Startup Founder',
      text: 'As a startup, we needed fast contract analysis without breaking the bank. Legistra is a game-changer.',
      avatar: '👩‍💻'
    }
  ];

  const features = [
    {
      icon: <DocumentTextIcon className="w-8 h-8" />,
      title: 'Smart Document Analysis',
      description: 'Advanced AI extracts key information and clauses from any legal document instantly.'
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: 'Risk Detection',
      description: 'Automatically identify high-risk clauses and flag potential legal issues before they become problems.'
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: 'Clause Extraction',
      description: 'Intelligent parsing breaks down complex documents into organized, searchable clause categories.'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Visual Analytics',
      description: 'Beautiful dashboards transform complex legal data into clear, actionable insights at a glance.'
    },
    {
      icon: <LightningBoltIcon className="w-8 h-8" />,
      title: 'AI Summarization',
      description: 'Get concise, accurate summaries of entire documents in seconds, not hours.'
    },
    {
      icon: <ArrowPathIcon className="w-8 h-8" />,
      title: 'Fast Processing',
      description: 'Process hundreds of documents with lightning-fast AI analysis, typically under 30 seconds each.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Document',
      description: 'Drag and drop your contract in PDF, DOCX, or TXT format. Support for multiple files.',
      color: 'from-blue-600 to-cyan-500'
    },
    {
      number: '02',
      title: 'AI Analyzes Content',
      description: 'Our advanced AI engine processes your document, extracting clauses and assessing risks in real-time.',
      color: 'from-purple-600 to-blue-500'
    },
    {
      number: '03',
      title: 'Get Insights & Reports',
      description: 'Receive comprehensive analysis with visual dashboards, summaries, and actionable recommendations.',
      color: 'from-indigo-600 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-background text-white">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-card/80 backdrop-blur-md border-b border-dark-border' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Legistra
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background gradient elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <span className="text-sm font-medium text-blue-300">✨ AI-Powered Legal Analysis</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                AI-Powered Legal Document Analysis in Seconds
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Upload contracts, detect risks, and extract key clauses instantly with advanced AI. Perfect for law students, lawyers, and businesses.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Get Started <ChevronRightIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                >
                  Try Demo
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-dark-border">
                <div>
                  <div className="text-2xl font-bold text-blue-400">100+</div>
                  <div className="text-sm text-gray-400">Documents Analyzed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">95%</div>
                  <div className="text-sm text-gray-400">Faster Review</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">99.8%</div>
                  <div className="text-sm text-gray-400">Accuracy Rate</div>
                </div>
              </div>
            </div>

            {/* Right Dashboard Preview */}
            <div className="relative animate-slide-up">
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-500/20 p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  {/* Mock Dashboard */}
                  <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
                    <div className="text-sm font-semibold text-gray-300 mb-3">Risk Analysis</div>
                    <div className="h-32 bg-gradient-to-t from-blue-500/20 to-purple-500/20 rounded-lg flex items-end justify-around px-4">
                      <div className="w-8 h-12 bg-blue-500 rounded-t opacity-80"></div>
                      <div className="w-8 h-24 bg-purple-500 rounded-t opacity-80"></div>
                      <div className="w-8 h-16 bg-cyan-500 rounded-t opacity-80"></div>
                      <div className="w-8 h-20 bg-blue-400 rounded-t opacity-80"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-dark-card rounded-lg p-3 border border-dark-border text-center">
                      <div className="text-2xl font-bold text-green-400">47</div>
                      <div className="text-xs text-gray-400">Clauses Found</div>
                    </div>
                    <div className="bg-dark-card rounded-lg p-3 border border-dark-border text-center">
                      <div className="text-2xl font-bold text-orange-400">8</div>
                      <div className="text-xs text-gray-400">High Risk</div>
                    </div>
                    <div className="bg-dark-card rounded-lg p-3 border border-dark-border text-center">
                      <div className="text-2xl font-bold text-blue-400">2.3s</div>
                      <div className="text-xs text-gray-400">Process Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-dark-card/50 border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 mb-8">Trusted by students and professionals worldwide</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {['👨‍🎓 Students', '⚖️ Attorneys', '🏢 Enterprises', '🚀 Startups'].map((item, i) => (
              <div key={i} className="px-6 py-3 bg-dark-background rounded-lg border border-dark-border text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to analyze legal documents faster and smarter</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-dark-card to-dark-background rounded-xl border border-dark-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 group-hover:text-purple-400 transition-colors mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to analyze your documents</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`p-8 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10 border border-opacity-20 border-current min-h-64 flex flex-col justify-between`}>
                  <div>
                    <div className="text-5xl font-bold opacity-20 mb-4">{step.number}</div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ChevronRightIcon className="w-8 h-8 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Visual Analytics Dashboard</h2>
            <p className="text-xl text-gray-400">Transform complex legal data into actionable insights</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-dark-background rounded-2xl border border-dark-border p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Risk Distribution Chart */}
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                  <h3 className="font-semibold text-gray-200 mb-4">Risk Distribution</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-gray-400">
                        <span>Critical</span>
                        <span>15%</span>
                      </div>
                      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{width: '15%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-gray-400">
                        <span>High</span>
                        <span>28%</span>
                      </div>
                      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{width: '28%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-gray-400">
                        <span>Medium</span>
                        <span>32%</span>
                      </div>
                      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{width: '32%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-gray-400">
                        <span>Low</span>
                        <span>25%</span>
                      </div>
                      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clause Breakdown */}
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                  <h3 className="font-semibold text-gray-200 mb-4">Clause Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Payment Terms', count: '3' },
                      { label: 'Confidentiality', count: '2' },
                      { label: 'Termination', count: '1' },
                      { label: 'Liability', count: '4' },
                      { label: 'Indemnification', count: '2' }
                    ].map((clause, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-400">{clause.label}</span>
                        <span className="font-semibold text-blue-400">{clause.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Panel */}
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                  <h3 className="font-semibold text-gray-200 mb-4">Document Summary</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Service agreement with 47 clauses. Key risks identified in payment and liability sections. Recommend legal review before execution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Why Choose Legistra?</h2>
              <div className="space-y-6">
                {[
                  { icon: '⚡', title: 'Save Hours of Work', desc: 'Analyze contracts in minutes, not days. Get instant insights on key clauses and risks.' },
                  { icon: '🛡️', title: 'Reduce Legal Risks', desc: 'Advanced AI catches potential issues and red flags you might miss in manual review.' },
                  { icon: '💡', title: 'Easy to Use', desc: 'No legal background needed. Simple, intuitive interface for everyone.' },
                  { icon: '🚀', title: 'Instant Results', desc: 'Process documents in seconds with real-time analysis and comprehensive reports.' }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-3xl">{benefit.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20 p-12 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-4">10x Faster Analysis</h3>
                <p className="text-gray-400 mb-6">Average contract analysis time reduced from 2 hours to 12 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Users Are Saying</h2>
            <p className="text-xl text-gray-400">Join thousands of satisfied legal professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`p-8 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeTestimonial === index
                    ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20'
                    : 'bg-dark-card border-dark-border hover:border-dark-border'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Start Analyzing Your Legal Documents Today</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Join law students, attorneys, and businesses saving hours on contract analysis every week.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              View Demo
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-6">No credit card required. Start analyzing in 30 seconds.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border bg-dark-card/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
                Legistra
              </div>
              <p className="text-gray-400 text-sm">AI-powered legal document analysis for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Legistra. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
