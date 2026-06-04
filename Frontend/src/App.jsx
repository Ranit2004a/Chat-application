import React from 'react'
import { Routes, Route } from 'react-router'
import Chatpage from './pages/Chatpage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
function App() {
  return (
    <Routes>
     <Route path='/signup' element={<SignUp />} />
     <Route path='/login' element={<Login />} />
     <Route path='/' element={<Chatpage />} />
    </Routes>
     
  )
}

export default App