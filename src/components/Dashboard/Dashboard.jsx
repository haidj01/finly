import React from 'react'
import IndicesCard from './IndicesCard'
import SignalsCard from './SignalsCard'
import PortfolioCard from './PortfolioCard'
import NewsCard from './NewsCard'

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-4 content-start scrollbar-thin">
      <IndicesCard />
      <SignalsCard />
      <PortfolioCard />
      <NewsCard />
    </div>
  )
}
