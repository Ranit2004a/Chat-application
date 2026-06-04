import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson, MdShare, MdGroups, MdPublic } from 'react-icons/md';

function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      alert('You must accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    console.log('Registering user:', { fullName, email, password });
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Account simulation successful! Welcome to FlashChat.');
    }, 2000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden vibrant-bg relative"
      ref={mainRef}
      onMouseMove={handleMouseMove}
    >
      {/* Particle background container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" ref={particleContainerRef} />

      {/* Animated background blobs */}
      <div className="bg-blob top-0 left-0 pointer-events-none" style={{ animationDelay: '0s' }} />
      <div className="bg-blob bottom-0 right-0 pointer-events-none" style={{ animationDelay: '-10s' }} />

      {/* Main Container: Split-Screen Island */}
      <main className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-card-entrance shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        
        {/* Left Side: Form Area */}
        <section className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white">
          <div className="w-full">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-3xl font-extrabold text-on-surface mb-2 font-sans tracking-tight">Sign Up</h1>
              <p className="text-sm text-secondary font-sans">Create your account, it's free</p>
            </header>

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Full Name */}
              <div className="space-y-1 group input-group transition-all duration-300 rounded-lg pb-1">
                <label className="text-[11px] font-extrabold tracking-wider text-on-surface-variant font-sans uppercase">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <MdPerson className="absolute left-0 text-xl text-outline group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    className="w-full pl-8 pr-4 py-1.5 bg-transparent border-b border-outline focus:border-primary outline-none transition-all duration-300 text-body-lg text-on-surface placeholder:text-outline-variant font-sans"
                    placeholder="Enter your full name" 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email ID */}
              <div className="space-y-1 group input-group transition-all duration-300 rounded-lg pb-1">
                <label className="text-[11px] font-extrabold tracking-wider text-on-surface-variant font-sans uppercase">
                  Email ID
                </label>
                <div className="relative flex items-center">
                  <MdEmail className="absolute left-0 text-xl text-outline group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    className="w-full pl-8 pr-4 py-1.5 bg-transparent border-b border-outline focus:border-primary outline-none transition-all duration-300 text-body-lg text-on-surface placeholder:text-outline-variant font-sans"
                    placeholder="Enter your email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 group input-group transition-all duration-300 rounded-lg pb-1">
                <label className="text-[11px] font-extrabold tracking-wider text-on-surface-variant font-sans uppercase">
                  Password
                </label>
                <div className="relative flex items-center">
                  <MdLock className="absolute left-0 text-xl text-outline group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    className="w-full pl-8 pr-12 py-1.5 bg-transparent border-b border-outline focus:border-primary outline-none transition-all duration-300 text-body-lg text-on-surface placeholder:text-outline-variant font-sans"
                    placeholder="Create a password" 
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
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1 group input-group transition-all duration-300 rounded-lg pb-1">
                <label className="text-[11px] font-extrabold tracking-wider text-on-surface-variant font-sans uppercase">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <MdLock className="absolute left-0 text-xl text-outline group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    className="w-full pl-8 pr-12 py-1.5 bg-transparent border-b border-outline focus:border-primary outline-none transition-all duration-300 text-body-lg text-on-surface placeholder:text-outline-variant font-sans"
                    placeholder="Confirm your password" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-0 text-xl text-outline hover:text-on-surface transition-colors" 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start gap-3 py-1.5">
                <input 
                  className="mt-1 h-4 w-4 rounded border-outline text-primary focus:ring-primary cursor-pointer accent-primary" 
                  id="terms" 
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <label className="text-xs text-secondary font-sans cursor-pointer select-none" htmlFor="terms">
                  I accept{' '}
                  <a className="text-primary font-bold hover:underline transition-all" href="#">
                    terms and conditions &amp; privacy policy
                  </a>
                </label>
              </div>

              {/* Sign Up / Link to Login */}
              <div className="text-sm text-secondary font-sans text-center mt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold link-underline">
                  Login
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="shimmer-btn w-full h-[50px] bg-on-surface text-white rounded-full text-sm font-bold tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 glow-shadow disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? 'PROCESSING...' : 'SIGN UP'}
              </button>
            </form>
          </div>
        </section>

        {/* Right Side: Dark Brand Area */}
        <section className="hidden md:flex w-1/2 relative bg-inverse-surface overflow-hidden flex-col justify-center items-center text-center p-12">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              ref={bgImageRef}
              alt="Laptop Workspace" 
              className="w-full h-full object-cover opacity-30 grayscale transition-transform duration-[20s] ease-out" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBomFXxIHYwEokj_MKSfwSd4G2DwlxeaA1q1-fCGTKZaPgOYF2RkKH1e-QuLT-CE9_dll86SUG1pQEd73vwxfbHj2lWBDdlVntZlpcjQN7NMfWYeYZlcQxKfBisBa96QajZqSuFwNKNDOsMlGNY26XqbcgeAvhF1QwP-aXPXjNAUN1w6M1XqYOVAFGEr5ngTIxq_xJ4PSdmOLX9t9KY7a5jtD088L3w3zeti_jPnyMO1f9dZcJ2k5WKWyOBdE_XUdtWTnKCURi6w" 
              style={{ transform: 'scale(1.1) translate(0px, 0px)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-on-surface opacity-80" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Brand Logo */}
            <h2 className="text-5xl text-white mb-2 leading-none font-black italic tracking-tighter transition-all duration-500 hover:tracking-normal cursor-default select-none font-sans">
              FlashChat
            </h2>
            
            {/* Social Connect Icons */}
            <div className="flex justify-center gap-6 mt-8">
              <a className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg" href="#">
                <MdShare className="text-xl" />
              </a>
              <a className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg" href="#">
                <MdGroups className="text-xl" />
              </a>
              <a className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg" href="#">
                <MdPublic className="text-xl" />
              </a>
            </div>
          </div>

          {/* Abstract Graphic Elements */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] border border-white opacity-10 rounded-full transition-transform duration-1000 hover:scale-110 pointer-events-none" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[300px] h-[300px] border border-white opacity-10 rounded-full transition-transform duration-[1.5s] hover:scale-125 pointer-events-none" />
        </section>
      </main>
    </div>
  );
}

export default SignUp;