import React from 'react'
import IndicesCard from './IndicesCard'
import SignalsCard from './SignalsCard'
import PortfolioCard from './PortfolioCard'
import NewsCard from './NewsCard'
import MarketRegimeCard from './MarketRegimeCard'

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start scrollbar-thin">
      <MarketRegimeCard />
      <IndicesCard />
      <SignalsCard />
      <PortfolioCard />
      <NewsCard />
    </div>
  )
}
