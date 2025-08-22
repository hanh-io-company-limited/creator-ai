'use client'

import { useState } from 'react'
import ContentGenerator from '../components/ContentGenerator'
import ModelStatus from '../components/ModelStatus'

export default function Home() {
  const [activeTab, setActiveTab] = useState('generate')

  return (
    <div className="container">
      <header>
        <h1>Creator AI</h1>
        <p>AI-powered content creation platform</p>
      </header>

      <nav style={{ margin: '2rem 0' }}>
        <button
          data-testid="generate-tab"
          className={`btn ${activeTab === 'generate' ? '' : 'btn-secondary'}`}
          onClick={() => setActiveTab('generate')}
          style={{ marginRight: '1rem' }}
        >
          Generate Content
        </button>
        <button
          data-testid="status-tab"
          className={`btn ${activeTab === 'status' ? '' : 'btn-secondary'}`}
          onClick={() => setActiveTab('status')}
        >
          Model Status
        </button>
      </nav>

      <main>
        {activeTab === 'generate' && <ContentGenerator />}
        {activeTab === 'status' && <ModelStatus />}
      </main>
    </div>
  )
}