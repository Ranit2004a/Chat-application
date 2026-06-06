import  React,{ useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import Chatpage from './pages/Chatpage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect (() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full vibrant-bg relative flex items-center justify-center overflow-hidden">
        <div className="text-white text-2xl animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (

    <div className="min-h-screen w-full vibrant-bg relative flex items-center justify-center overflow-hidden">

      {/* Glowing White Shine Spots */}
      <div className="absolute top-0 left-4 size-96 bg-white opacity-20 blur-[100px] pointer-events-none z-0 animate-[pulse_8s_infinite_alternate]" />
      <div className="absolute bottom-0 right-4 size-96 bg-white opacity-20 blur-[100px] pointer-events-none z-0 animate-[pulse_8s_infinite_alternate_4s]" />

      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <Routes>
          <Route path='/signup' element={!authUser ? <SignUp /> : <Navigate to={"/"} />} />
          <Route path='/login' element={!authUser ? <Login /> : <Navigate to={"/"} />} />
          <Route path='/' element={authUser ? <Chatpage /> : <Navigate to={"/login"} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App