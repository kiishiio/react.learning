import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import './App.css';

const Home = lazy(() => import('./pages/home'));
const About = lazy(() => import('./pages/about'));
const Tasks = lazy(() => import('./pages/tasks'));

const App: React.FC = () => {
  return (
    <React.Fragment>
      <div className='top'>
        <nav className='insetShadow' style={{ display: 'flex', justifyContent: 'space-around'}}>
          <Link to="/">Home</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
      </div>
      
      <div className='main'>
        <div className='content'>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<Tasks />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </React.Fragment>
    )
}

export default App;
