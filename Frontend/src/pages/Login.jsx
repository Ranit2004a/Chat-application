import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const mainRef = useRef(null);
  const bgImageRef = useRef(null);
  const particleContainerRef = useRef(null);

  // Spawning floating particles on mount
  useEffect(() => {
    const container = particleContainerRef.current;
    if (!container) return;

    const particleCount = 15;
    const activeParticles = [];

    const resetParticle = (particle) => {
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.top = Math.random() * 100 + 'vh';
      particle.style.opacity = Math.random() * 0.5;
    };

    const animateParticle = (particle) => {
      const duration = Math.random() * 10000 + 10000;
      const targetX = (Math.random() - 0.5) * 200;
      const targetY = (Math.random() - 0.5) * 200;

      return particle.animate([
        { transform: 'translate(0, 0)', opacity: particle.style.opacity },
        { transform: `translate(${targetX}px, ${targetY}px)`, opacity: 0 }
      ], {
        duration: duration,
        easing: 'ease-in-out',
        iterations: Infinity,
        direction: 'alternate'
      });
    };

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const size = Math.random() * 15 + 5 + 'px';
      particle.style.width = size;
      particle.style.height = size;

      resetParticle(particle);
      container.appendChild(particle);
      const animation = animateParticle(particle);
      activeParticles.push({ element: particle, animation });
    }

    return () => {
      activeParticles.forEach(({ element, animation }) => {
        animation.cancel();
        element.remove();
      });
    };
  }, []);

  // Parallax mouse move handler
  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768 || !bgImageRef.current) return;
    
    const xAxis = (window.innerWidth / 2 - e.clientX) / 100;
    const yAxis = (window.innerHeight / 2 - e.clientY) / 100;
    
    bgImageRef.current.style.transform = `scale(1.1) translate(${xAxis}px, ${yAxis}px)`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
    // Authentication logic will hook here
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden bg-transparent relative"
      ref={mainRef}
      onMouseMove={handleMouseMove}
    >
      {/* Particle background container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" ref={particleContainerRef} />

      {/* Animated background blobs */}
      <div className="bg-blob top-0 left-0 pointer-events-none" style={{ animationDelay: '0s' }} />
      <div className="bg-blob bottom-0 right-0 pointer-events-none" style={{ animationDelay: '-10s' }} />

      {/* Main Container: Split-Screen Island */}
      <main className="w-full max-w-[860px] min-h-[580px] flex flex-col md:flex-row bg-white dark:bg-inverse-surface rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-card-entrance shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        
        {/* Left Side: Form Area */}
        <section className="flex-1 bg-white p-6 md:p-10 flex flex-col justify-center">
          <div className="max-w-[400px] mx-auto w-full">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-3xl font-extrabold text-on-surface mb-2 font-sans tracking-tight">Login</h1>
              <p className="text-sm text-secondary font-sans">Welcome back! Please login to your account</p>
            </header>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Email Input Group */}
              <div className="space-y-2 group input-group transition-all duration-300 rounded-lg pb-1">
                <label className="text-[11px] font-extrabold tracking-wider text-on-surface-variant font-sans" htmlFor="email">
                  EMAIL ID
                </label>
                <div className="relative flex items-center">
                  <MdEmail className="absolute left-0 text-xl text-outline group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-outline focus:border-primary outline-none transition-all duration-300 text-body-lg text-on-surface placeholder:text-outline-variant font-sans"
                    id="email" 
                    placeholder="Enter your email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input Group */}
              <div className="space-y-2 group input-group transition-all duration-300 rounded-lg pb-1">
                <label className="text-[11px] font-extrabold tracking-wider text-on-surface-variant font-sans" htmlFor="password">
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <MdLock className="absolute left-0 text-xl text-outline group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    className="w-full pl-8 pr-12 py-2 bg-transparent border-b border-outline focus:border-primary outline-none transition-all duration-300 text-body-lg text-on-surface placeholder:text-outline-variant font-sans"
                    id="password" 
                    placeholder="Enter your password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-0 text-xl text-outline hover:text-on-surface transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link & Sign Up Link */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-secondary font-sans">
                  New here? <Link to="/signup" className="text-primary font-bold link-underline">Sign Up</Link>
                </span>
                <a className="text-sm text-primary font-bold link-underline" href="#">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="shimmer-btn w-full h-[50px] bg-on-surface text-white rounded-full text-sm font-bold tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-6 glow-shadow"
              >
                LOGIN
              </button>
            </form>
          </div>
        </section>

        {/* Right Side: Brand Area */}
        <section className="hidden md:flex flex-1 relative items-center justify-center p-10 overflow-hidden animate-slide-in-right">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              ref={bgImageRef}
              alt="Laptop background" 
              className="w-full h-full object-cover grayscale brightness-50 transition-transform duration-[20s] ease-out" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRdnQY9e7t-SHjOSAo4-Roz1ekL7XFL-MKa5HusiG8W20GEkP_6bvyvGsHzCdJRRidsN1TPYVkgP0BAnEO0lAJi21dbsAXv7E1YemQ4YkrmNgoWcr-_h7ffEbcDQjMOvS4u1OMz2AF4Ii6iKzU9r3g46FH21mDZ-U5V0nJTwvj45cCVUKGhrPpk7ATWvj9nX6NiR_a3UQjH62UI0qlx1uwGakeE5xjpXXsDaFesXsG6K-Epj6HTu03Gq1CwIAwXop4S-5nZ86Ckg" 
              style={{ transform: 'scale(1.1) translate(0px, 0px)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-on-surface opacity-80" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-sm">
            <div className="mb-12 flex justify-center">
              {/* Dots Pattern */}
              <div className="grid grid-cols-4 gap-2 opacity-50">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            
            <h2 className="text-4xl text-white mb-6 tracking-widest italic font-black font-sans transition-all duration-700 hover:tracking-[0.2em] cursor-pointer selection:bg-transparent">
              FlashChat
            </h2>

            {/* Abstract Circles Graphic */}
            <div className="mt-20 opacity-30">
              <div className="w-48 h-48 border-2 border-white rounded-full mx-auto relative flex items-center justify-center animate-[spin_30s_linear_infinite]">
                <div className="w-36 h-36 border border-white rounded-full" />
                <div className="w-24 h-24 border border-white rounded-full" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;