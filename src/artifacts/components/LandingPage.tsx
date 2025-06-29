import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  useEffect(() => {
    // Scroll animations with Intersection Observer
    const observerOptions = {
      root: null,
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // FAQ accordion toggle
    const handleFAQClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('faq-question')) {
        const faqItem = target.parentElement;
        const isActive = faqItem?.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('active');
          const answer = item.querySelector('.faq-answer') as HTMLElement;
          if (answer) {
            answer.style.maxHeight = '0';
            answer.style.padding = '0 20px';
          }
        });

        if (!isActive && faqItem) {
          faqItem.classList.add('active');
          const answer = faqItem.querySelector('.faq-answer') as HTMLElement;
          if (answer) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.padding = '20px';
          }
        }
      }
    };

    document.addEventListener('click', handleFAQClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleFAQClick);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Include the styles in the document head */}
      {typeof document !== 'undefined' && !document.getElementById('landing-page-styles') && (
        <style id="landing-page-styles" dangerouslySetInnerHTML={{
          __html: `
            .landing-page {
              font-family: 'DM Sans', sans-serif;
              line-height: 1.6;
              color: #333;
              overflow-x: hidden;
            }

            .landing-page .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 20px;
            }

            .landing-page .btn {
              display: inline-block;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
            }

            .landing-page .btn-primary {
              background-color: #2bb24c !important;
              color: #fff !important;
            }

            .landing-page .btn-primary:hover {
              background-color: #239b3f !important;
              transform: translateY(-2px);
            }

            .landing-page .animate-on-scroll {
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }

            .landing-page .animate-on-scroll.visible {
              opacity: 1;
              transform: translateY(0);
            }

            .landing-page .navbar {
              background-color: #fff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              position: sticky;
              top: 0;
              z-index: 100;
              transition: background-color 0.3s;
            }

            .landing-page .navbar.scrolled {
              background-color: rgba(255, 255, 255, 0.95);
            }

            .landing-page .navbar .container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 20px;
            }

            .landing-page .logo {
              font-size: 1.8rem;
              font-weight: 700;
              color: #000;
              text-decoration: none;
            }

            .landing-page .nav-links {
              display: flex;
              list-style: none;
              gap: 25px;
              align-items: center;
            }

            .landing-page .hero {
              background: linear-gradient(180deg, #f9f9f9, #fff);
              min-height: 80vh;
              text-align: center;
              position: relative;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 70px 20px 40px;
              box-sizing: border-box;
            }

            .landing-page .hero-content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 40px;
              max-width: 1200px;
              width: 100%;
            }

            .landing-page .hero-text {
              flex: 1;
              text-align: left;
            }

            .landing-page .hero-text h1 {
              font-size: 3.2rem;
              margin-bottom: 20px;
              font-weight: 700;
              color: #333;
            }

            .landing-page .hero-text p {
              font-size: 1.3rem;
              margin-bottom: 30px;
              color: #666;
              max-width: 500px;
            }

            .landing-page .hero-cta {
              display: flex;
              justify-content: flex-start;
              gap: 15px;
            }

            .landing-page .hero-cta .btn-primary {
              padding: 15px 30px;
              font-size: 1.1rem;
            }

            .landing-page .hero-image {
              flex: 1;
              display: flex;
              justify-content: flex-end;
            }

            .landing-page .hero-image img {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              transition: transform 0.3s ease;
            }

            .landing-page .hero-image img:hover {
              transform: scale(1.05);
            }

            .landing-page .features {
              padding: 80px 0;
              text-align: center;
              background-color: #fff;
            }

            .landing-page .features h2 {
              font-size: 2.5rem;
              margin-bottom: 20px;
              font-weight: 700;
            }

            .landing-page .features p {
              font-size: 1.2rem;
              color: #666;
              max-width: 700px;
              margin: 0 auto 40px;
            }

            .landing-page .feature-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 30px;
            }

            .landing-page .feature-card {
              background-color: #fff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition: transform 0.3s, box-shadow 0.3s;
            }

            .landing-page .feature-card:hover {
              transform: translateY(-10px);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            .landing-page .feature-card i {
              font-size: 2.5rem;
              color: #2bb24c;
              margin-bottom: 20px;
            }

            .landing-page .feature-card h3 {
              font-size: 1.6rem;
              margin-bottom: 15px;
              font-weight: 600;
            }

            .landing-page .feature-card p {
              color: #666;
              font-size: 1rem;
            }

            .landing-page .cta {
              padding: 80px 0;
              text-align: center;
              background: linear-gradient(135deg, #2bb24c, #1a8b3a);
              color: #fff;
            }

            .landing-page .cta h2 {
              font-size: 2.5rem;
              margin-bottom: 20px;
              font-weight: 700;
            }

            .landing-page .cta p {
              font-size: 1.2rem;
              margin-bottom: 30px;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
            }

            .landing-page .cta .btn-primary {
              background-color: #fff !important;
              color: #2bb24c !important;
              font-size: 1.1rem;
              padding: 15px 30px;
            }

            .landing-page .cta .btn-primary:hover {
              background-color: #f0f0f0 !important;
              color: #239b3f !important;
            }

            @media (max-width: 768px) {
              .landing-page .hero {
                padding: 60px 20px 40px;
                min-height: auto;
              }

              .landing-page .hero-content {
                flex-direction: column;
                gap: 30px;
                text-align: center;
              }

              .landing-page .hero-text {
                text-align: center;
              }

              .landing-page .hero-text h1 {
                font-size: 2.2rem;
              }

              .landing-page .hero-text p {
                font-size: 1.1rem;
                max-width: 100%;
              }

              .landing-page .hero-cta {
                justify-content: center;
              }

              .landing-page .hero-image {
                justify-content: center;
              }

              .landing-page .hero-image img {
                max-width: 80%;
              }

              .landing-page .features h2, .landing-page .cta h2 {
                font-size: 2rem;
              }
            }
          `
        }} />
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <a href="#" className="logo">AgriMind AI</a>
          <ul className="nav-links">
            <li>
              <Button 
                onClick={onGetStarted} 
                className="btn btn-primary"
              >
                Get Started
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="animate-on-scroll">Empower Your Farm with AgriMind AI</h1>
              <p className="animate-on-scroll">
                AgriMind AI uses advanced AI to help farmers track, record, and plan sustainability and efficiency metrics like water usage, CO2 emissions, and pesticide tracking.
              </p>
              <div className="hero-cta animate-on-scroll">
                <Button 
                  onClick={onGetStarted} 
                  className="btn btn-primary"
                >
                  Get Started for Free
                </Button>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="https://s1.feedly.com/marketing/_next/static/chunks/images/ai-feeds.f2fd6d72_640.png" 
                alt="AgriMind AI Illustration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="animate-on-scroll">Why AgriMind AI is Your Farming Solution</h2>
          <p className="animate-on-scroll">
            Leverage AI to track and optimize key sustainability and efficiency metrics, helping your farm thrive while reducing environmental impact.
          </p>
          <div className="feature-grid">
            <div className="feature-card animate-on-scroll">
              <i className="fas fa-tint"></i>
              <h3>Track Water Usage</h3>
              <p>Monitor and optimize water consumption with AI-driven insights to ensure sustainable irrigation practices.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <i className="fas fa-cloud"></i>
              <h3>Measure CO2 Emissions</h3>
              <p>Track your farm's carbon footprint and receive recommendations to reduce emissions and improve sustainability.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <i className="fas fa-spray-can"></i>
              <h3>Pesticide Tracking</h3>
              <p>Record pesticide usage and get AI suggestions for safer, eco-friendly alternatives to protect your crops and the environment.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <i className="fas fa-seedling"></i>
              <h3>Optimize Crop Yields</h3>
              <p>Use AI to analyze soil health and crop data, ensuring maximum productivity with minimal resources.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <i className="fas fa-chart-line"></i>
              <h3>Analyze Efficiency Metrics</h3>
              <p>Gain insights into labor, energy, and resource efficiency to streamline operations and reduce costs.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <i className="fas fa-shield-alt"></i>
              <h3>Secure Data Management</h3>
              <p>Your farm data is protected with top-tier encryption and privacy-first policies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2 className="animate-on-scroll">Join the AgriMind AI Community Today</h2>
          <p className="animate-on-scroll">
            Start tracking, planning, and optimizing your farm's sustainability metrics with AgriMind AI. Sign up now for free and grow smarter.
          </p>
          <Button 
            onClick={onGetStarted} 
            className="btn btn-primary animate-on-scroll"
          >
            Try AgriMind AI Now
          </Button>
        </div>
      </section>

      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
    </div>
  );
};

export default LandingPage;
