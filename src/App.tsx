import React from 'react';
import { Github, Linkedin, Twitter, Mail, Moon, Menu, ExternalLink, Shield, Code, Lock, Server, FileSearch, Bell, Youtube, Database, Cloud, Brain, Download } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`fixed w-full z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                SecurityPro
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="#home" isDark={isDarkMode}>Home</NavLink>
              <NavLink href="#services" isDark={isDarkMode}>Services</NavLink>
              <NavLink href="#about" isDark={isDarkMode}>About</NavLink>
              <NavLink href="#youtube" isDark={isDarkMode}>YouTube</NavLink>
              <NavLink href="#portfolio" isDark={isDarkMode}>Portfolio</NavLink>
              <NavLink href="#blog" isDark={isDarkMode}>Blog</NavLink>
              <NavLink href="#contact" isDark={isDarkMode}>Contact</NavLink>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Moon className={isDarkMode ? 'text-white' : 'text-gray-900'} />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-md ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                <Menu />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <MobileNavLink href="#home" isDark={isDarkMode}>Home</MobileNavLink>
              <MobileNavLink href="#services" isDark={isDarkMode}>Services</MobileNavLink>
              <MobileNavLink href="#about" isDark={isDarkMode}>About</MobileNavLink>
              <MobileNavLink href="#youtube" isDark={isDarkMode}>YouTube</MobileNavLink>
              <MobileNavLink href="#portfolio" isDark={isDarkMode}>Portfolio</MobileNavLink>
              <MobileNavLink href="#blog" isDark={isDarkMode}>Blog</MobileNavLink>
              <MobileNavLink href="#contact" isDark={isDarkMode}>Contact</MobileNavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section id="home" className={`py-20 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                <span className="block">Cybersecurity Professional</span>
                <span className="block text-blue-600">Protecting Digital Assets</span>
              </h1>
              <p className={`mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Specializing in penetration testing, security research, and digital forensics.
                Securing tomorrow's technology, today.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="#contact"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className={`py-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-12">Our Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ServiceCard
                  icon={<Shield className="h-12 w-12 text-blue-500" />}
                  title="Penetration Testing"
                  description="Comprehensive security assessments to identify vulnerabilities in your systems before attackers do."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Code className="h-12 w-12 text-blue-500" />}
                  title="Secure Code Review"
                  description="Expert analysis of your application code to identify security flaws and implement best practices."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Lock className="h-12 w-12 text-blue-500" />}
                  title="Security Consulting"
                  description="Strategic guidance on implementing robust security measures and compliance frameworks."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Server className="h-12 w-12 text-blue-500" />}
                  title="Infrastructure Security"
                  description="Securing your cloud and on-premise infrastructure against modern threats."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<FileSearch className="h-12 w-12 text-blue-500" />}
                  title="Security Audits"
                  description="Thorough assessment of your security posture and compliance with industry standards."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Bell className="h-12 w-12 text-blue-500" />}
                  title="Incident Response"
                  description="24/7 support for handling and recovering from security incidents and breaches."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Database className="h-12 w-12 text-blue-500" />}
                  title="Database Security"
                  description="Protecting your valuable data with advanced database security measures and encryption."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Cloud className="h-12 w-12 text-blue-500" />}
                  title="Cloud Security"
                  description="Specialized security solutions for cloud environments and hybrid infrastructures."
                  isDark={isDarkMode}
                />
                <ServiceCard
                  icon={<Brain className="h-12 w-12 text-blue-500" />}
                  title="Security Training"
                  description="Comprehensive security awareness training and workshops for your team."
                  isDark={isDarkMode}
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={`py-20 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-8">About Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg"
                  alt="Cybersecurity Professional"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  With over a decade of experience in cybersecurity, I specialize in protecting organizations
                  from emerging digital threats. My expertise includes:
                </p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <span className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">✓</span>
                    Penetration Testing & Vulnerability Assessment
                  </li>
                  <li className="flex items-center">
                    <span className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">✓</span>
                    Incident Response & Digital Forensics
                  </li>
                  <li className="flex items-center">
                    <span className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">✓</span>
                    Security Architecture & Design
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href="/path-to-your-cv.pdf"
                    download
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download CV
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Section */}
        <section id="youtube" className={`py-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Latest Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <YouTubeCard
                title="Introduction to Penetration Testing"
                thumbnail="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg"
                views="15K"
                date="2 weeks ago"
                isDark={isDarkMode}
              />
              <YouTubeCard
                title="Advanced Web Security Techniques"
                thumbnail="https://images.pexels.com/photos/5380651/pexels-photo-5380651.jpeg"
                views="12K"
                date="3 weeks ago"
                isDark={isDarkMode}
              />
              <YouTubeCard
                title="Cybersecurity Best Practices"
                thumbnail="https://images.pexels.com/photos/5380647/pexels-photo-5380647.jpeg"
                views="20K"
                date="1 month ago"
                isDark={isDarkMode}
              />
            </div>
            <div className="text-center mt-8">
              <a
                href="https://youtube.com/@your-channel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Youtube className="w-5 h-5 mr-2" />
                Visit Channel
              </a>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className={`py-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <PortfolioCard
                title="Vulnerability Scanner"
                description="Automated security assessment tool for web applications"
                image="https://images.pexels.com/photos/5380651/pexels-photo-5380651.jpeg"
                link="#"
                isDark={isDarkMode}
              />
              <PortfolioCard
                title="Security Audit Framework"
                description="Comprehensive security audit toolkit for enterprise systems"
                image="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg"
                link="#"
                isDark={isDarkMode}
              />
              <PortfolioCard
                title="Threat Detection System"
                description="ML-powered threat detection and response system"
                image="https://images.pexels.com/photos/5380647/pexels-photo-5380647.jpeg"
                link="#"
                isDark={isDarkMode}
              />
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className={`py-20 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BlogCard
                title="Zero-Day Vulnerability Detection"
                description="Learn about modern techniques for identifying zero-day vulnerabilities in web applications."
                date="March 15, 2024"
                image="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg"
                isDark={isDarkMode}
              />
              <BlogCard
                title="Securing Cloud Infrastructure"
                description="Best practices for securing cloud infrastructure and preventing data breaches."
                date="March 10, 2024"
                image="https://images.pexels.com/photos/5380651/pexels-photo-5380651.jpeg"
                isDark={isDarkMode}
              />
              <BlogCard
                title="Incident Response Planning"
                description="Creating an effective incident response plan for your organization."
                date="March 5, 2024"
                image="https://images.pexels.com/photos/5380647/pexels-photo-5380647.jpeg"
                isDark={isDarkMode}
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`py-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Get in Touch</h2>
            <div className="max-w-lg mx-auto">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <footer className={`py-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-6">
              <SocialLink href="https://github.com" icon={<Github />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin />} />
              <SocialLink href="https://twitter.com" icon={<Twitter />} />
              <SocialLink href="mailto:contact@example.com" icon={<Mail />} />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavLink({ href, children, isDark }: { href: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <a
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isDark
          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
          : 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </a>
  );
}

function MobileNavLink({ href, children, isDark }: { href: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <a
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isDark
          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
          : 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </a>
  );
}

function ServiceCard({ icon, title, description, isDark }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}) {
  return (
    <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
      <p className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {description}
      </p>
    </div>
  );
}

function PortfolioCard({ title, description, image, link, isDark }: { 
  title: string;
  description: string;
  image: string;
  link: string;
  isDark: boolean;
}) {
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        <a
          href={link}
          className="inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          View Project <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function BlogCard({ title, description, date, image, isDark }: {
  title: string;
  description: string;
  date: string;
  image: string;
  isDark: boolean;
}) {
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>{date}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        <a
          href="#"
          className="inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          Read More <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-400 hover:text-gray-500"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
}

function YouTubeCard({ title, thumbnail, views, date, isDark }: {
  title: string;
  thumbnail: string;
  views: string;
  date: string;
  isDark: boolean;
}) {
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
      <div className="relative">
        <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Youtube className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>{views} views</span>
          <span className="mx-2">•</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}

export default App;