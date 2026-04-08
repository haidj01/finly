import React from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import Chat from './components/Chat/Chat'

export default function App() {
  const view = useStore(s => s.view)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {view === 'dashboard' ? <Dashboard /> : <Chat />}
        </main>
      </div>
    </div>
  )
}
