import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Other
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Connect = lazy(() => import('./pages/Connect'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));

// Foundation
const HTML = lazy(() => import('./pages/HTML'));
const CSS = lazy(() => import('./pages/CSS'));
const JavaScript = lazy(() => import('./pages/JavaScript'));

// Styling
const Bootstrap = lazy(() => import('./pages/Bootstrap'));
const Tailwind = lazy(() => import('./pages/Tailwind'));

// React
const ReactPage = lazy(() => import('./pages/ReactPage'));

// Backend
const NodeJS = lazy(() => import('./pages/NodeJS'));
const Express = lazy(() => import('./pages/Express'));
const APIs = lazy(() => import('./pages/APIs'));
const Nodemailer = lazy(() => import('./pages/Nodemailer'));
const Payments = lazy(() => import('./pages/Payments'));

// Databases
const MongoDB = lazy(() => import('./pages/MongoDB'));
const Mongoose = lazy(() => import('./pages/Mongoose'));
const Redis = lazy(() => import('./pages/Redis'));
const SQL = lazy(() => import('./pages/SQL'));

// Advanced Topics
const Auth = lazy(() => import('./pages/Auth'));
const FileUploads = lazy(() => import('./pages/FileUploads'));
const SocketIO = lazy(() => import('./pages/SocketIO'));

// Quality & Testing (Pedagogical Reordering: moves before DevOps)
const TypeScript = lazy(() => import('./pages/TypeScript'));
const Testing = lazy(() => import('./pages/Testing'));
const ErrorTracking = lazy(() => import('./pages/ErrorTracking'));

// DevOps & Deployment
const Git = lazy(() => import('./pages/Git'));
const Docker = lazy(() => import('./pages/Docker'));
const CICD = lazy(() => import('./pages/CICD'));
const Deployment = lazy(() => import('./pages/Deployment'));

// Build
const MiniProjects = lazy(() => import('./pages/MiniProjects'));
const AppClones = lazy(() => import('./pages/Clones'));
const CloneDetail = lazy(() => import('./pages/CloneDetail'));

export default function App() {
    return (
        <Routes>
            {/* Landing page (Full screen, no sidebar) */}
            <Route path="/" element={<Landing />} />

            {/* Main App with Sidebar */}
            <Route element={<Layout />}>
                <Route path="/dashboard"            element={<Dashboard />} />
                <Route path="/bookmarks"            element={<BookmarksPage />} />

                {/* Foundation */}
                <Route path="/learn/html"           element={<HTML />} />
                <Route path="/learn/css"            element={<CSS />} />
                <Route path="/learn/javascript"     element={<JavaScript />} />

                {/* Styling */}
                <Route path="/learn/bootstrap"      element={<Bootstrap />} />
                <Route path="/learn/tailwind"       element={<Tailwind />} />

                {/* React */}
                <Route path="/learn/react"          element={<ReactPage />} />

                {/* Backend */}
                <Route path="/learn/nodejs"         element={<NodeJS />} />
                <Route path="/learn/express"        element={<Express />} />
                <Route path="/learn/apis"           element={<APIs />} />
                <Route path="/learn/nodemailer"     element={<Nodemailer />} />
                <Route path="/learn/payments"       element={<Payments />} />

                {/* Databases */}
                <Route path="/learn/mongodb"        element={<MongoDB />} />
                <Route path="/learn/mongoose"       element={<Mongoose />} />
                <Route path="/learn/redis"          element={<Redis />} />
                <Route path="/learn/sql"            element={<SQL />} />

                {/* Advanced Topics */}
                <Route path="/learn/auth"           element={<Auth />} />
                <Route path="/learn/uploads"        element={<FileUploads />} />
                <Route path="/learn/socketio"       element={<SocketIO />} />

                {/* Quality & Testing (Moves before DevOps) */}
                <Route path="/learn/typescript"     element={<TypeScript />} />
                <Route path="/learn/testing"        element={<Testing />} />
                <Route path="/learn/error-tracking" element={<ErrorTracking />} />

                {/* DevOps & Deployment */}
                <Route path="/learn/git"            element={<Git />} />
                <Route path="/learn/docker"         element={<Docker />} />
                <Route path="/learn/cicd"           element={<CICD />} />
                <Route path="/learn/deploy"         element={<Deployment />} />

                {/* Build */}
                <Route path="/mini-projects"        element={<MiniProjects />} />
                <Route path="/clones"               element={<AppClones />} />
                <Route path="/clones/:id"           element={<CloneDetail />} />

                {/* More */}
                <Route path="/connect"              element={<Connect />} />

                {/* Fallback */}
                <Route path="*"                     element={<NotFound />} />
            </Route>
        </Routes>
    );
}
