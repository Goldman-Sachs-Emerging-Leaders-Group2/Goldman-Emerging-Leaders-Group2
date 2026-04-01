import { useState, useMemo } from 'react'

const card = 'rounded-xl p-5 transition-all duration-150 hover:border-[var(--accent)] hover:bg-[rgba(181,152,90,0.03)]'
const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }
const cardHeader = 'flex items-center justify-between mb-4'
const cardTitle = 'text-base font-semibold m-0'

const MUTUAL_FUND_TEMPLATES = [
  {
    name: 'Growth Equity Fund',
    ticker: 'GROFX',
    description: 'Invests in fast-growing companies. This has higher risk, but offers the chance for a bigger reward.',
    avgReturn: '10-12%',
    risk: 'High'
  },
  {
    name: 'Dividend Income Fund',
    ticker: 'VALIX',
    description: 'Invests in companies that pay out regular cash (dividends). Great for creating a steady income stream.',
    avgReturn: '6-8%',
    risk: 'Moderate'
  },
  {
    name: 'Balanced Target Fund',
    ticker: 'BALTX',
    description: 'Mixes stocks and bonds together. It aims to grow your money while keeping the risk lower.',
    avgReturn: '7-9%',
    risk: 'Moderate-Low'
  }
]

const VOCABULARY = [
  { term: 'Stock', definition: 'A tiny piece of ownership in a company. When the company does well, your piece goes up in value.' },
  { term: 'Bond', definition: 'A loan you make to a company or government. They pay you back with extra interest over time.' },
  { term: 'Mutual Fund', definition: 'A basket of different stocks and bonds. You and other people put your money in, and an expert manages the basket.' },
  { term: 'Index Fund', definition: 'A type of mutual fund designed to follow a whole market (like the top 500 companies) rather than having an expert pick individual winners.' },
  { term: 'Compound Interest', definition: 'Earning money on your savings, plus earning money on the interest you already made. It is like a snowball rolling down a hill.' },
  { term: 'Diversification', definition: 'The idea of not putting all your eggs in one basket. Spreading your money across different investments lowers your risk.' },
  { term: 'Risk vs. Reward', definition: 'The basic rule of investing: if you want the chance to make more money (reward), you usually have to take more chances of losing it (risk).' },
  { term: 'Dividend', definition: 'A small bonus cash payment that some companies give to their shareholders out of their profits.' },
  { term: 'Volatility', definition: 'How much and how quickly an investment goes up and down in price. High volatility means a bumpier ride.' },
  { term: 'Portfolio', definition: 'The complete collection of all your investments grouped together.' },
]

const TIPS_AND_TRICKS = [
  "Start as early as you can. Time in the market is much more important than timing the market.",
  "Pay yourself first: set up automatic transfers to your investment accounts on payday.",
  "Don't panic when the market drops. Markets go up and down, but historically they trend upward over the long haul.",
  "Keep your fees low. High fees can eat up a big chunk of your compound interest over 20 years.",
  "Make sure you have an emergency savings fund before investing money you might need next month.",
  "Diversify. If one company goes bankrupt, your whole portfolio won't crash if you have money in many different places.",
  "Ignore the daily news and stock ticker. Checking your portfolio every day can lead to emotional and bad decisions.",
  "Take advantage of matching! If your job offers a 401(k) match, put in at least enough to get that free money.",
  "Rebalance your investments once a year to make sure you aren't carrying more risk than you planned.",
  "You don't need to be rich to start. Many apps and funds let you begin investing with just $5 or $10."
]

export default function LearnPanel() {
  const [principal, setPrincipal] = useState(1000)
  const [contribution, setContribution] = useState(100)
  const [years, setYears] = useState(10)
  const [rate, setRate] = useState(8)

  const randomTips = useMemo(() => {
    const shuffled = [...TIPS_AND_TRICKS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }, [])

  const compoundData = useMemo(() => {
    let total = principal
    let totalContributions = principal
    const yearlyData = [{ year: 0, total: Math.round(total), contributions: totalContributions }]
    
    for (let i = 1; i <= years; i++) {
       const annualContribution = contribution * 12
       totalContributions += annualContribution
       // simplify to annual compounding for demo
       total = (total + annualContribution) * (1 + rate / 100)
       yearlyData.push({ year: i, total: Math.round(total), contributions: totalContributions })
    }
    return yearlyData
  }, [principal, contribution, years, rate])

  return (
    <section className="animate-fade-in-up flex flex-col gap-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Learn the Basics</h1>
        <p className="text-[var(--text-secondary)]">Learn how mutual funds work, see how your money can grow over time, and understand basic investing words.</p>
      </div>

      <div className={card} style={cardStyle}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Mutual Fund Examples</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MUTUAL_FUND_TEMPLATES.map(fund => (
            <div key={fund.ticker} className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] flex flex-col h-full hover:border-[var(--accent)] transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-[0.95rem] text-[var(--accent)]">{fund.name}</h3>
                 <span className="text-xs bg-[var(--card-border)] px-2 py-0.5 rounded text-[var(--text-primary)]">{fund.ticker}</span>
               </div>
               <p className="text-sm text-[var(--text-secondary)] mb-4 flex-grow">{fund.description}</p>
               <div className="flex justify-between items-center text-xs text-[var(--text-muted)] border-t border-[var(--card-border)] pt-2 mt-auto">
                 <span>Avg Return: <strong className="text-[var(--text-primary)]">{fund.avgReturn}</strong></span>
                 <span>Risk: <strong className="text-[var(--text-primary)]">{fund.risk}</strong></span>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className={card} style={cardStyle}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>The Power of Compound Interest</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Play with the numbers below to see how small, regular savings can turn into a lot of money over time thanks to "interest on interest."
            </p>
            
            <div className="space-y-3">
              <label className="block">
                 <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1 block">Initial Principal ($)</span>
                 <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-md p-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" />
              </label>
              <label className="block">
                 <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1 block">Monthly Contribution ($)</span>
                 <input type="number" value={contribution} onChange={e => setContribution(Number(e.target.value))} className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-md p-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" />
              </label>
              <label className="block">
                 <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1 block">Years to Grow</span>
                 <input type="range" min="1" max="40" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-[var(--accent)] cursor-pointer" />
                 <div className="text-right text-xs text-[var(--text-primary)] mt-1">{years} Years</div>
              </label>
              <label className="block">
                 <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1 block">Expected Annual Rate (%)</span>
                 <input type="range" min="1" max="15" step="0.5" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-[var(--accent)] cursor-pointer" />
                 <div className="text-right text-xs text-[var(--text-primary)] mt-1">{rate}%</div>
              </label>
            </div>
          </div>
          
          <div className="lg:col-span-2 flex flex-col h-full bg-[rgba(255,255,255,0.02)] p-4 rounded-lg border border-[var(--card-border)]">
             <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Total Value after {years} years</div>
                  <div className="text-3xl font-bold text-[var(--success)]">${compoundData[compoundData.length - 1].total.toLocaleString()}</div>
                </div>
             </div>
             
             <div className="flex-1 flex items-end gap-1 min-h-[200px] mt-4 pt-4 border-t border-[var(--card-border)]">
               {compoundData.filter((_, i) => i % Math.ceil(years/20) === 0).map((data, i) => {
                  const maxVal = compoundData[compoundData.length - 1].total;
                  const heightPct = (data.total / maxVal) * 100;
                  
                  return (
                    <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                         Year {data.year}<br/>
                         Total: ${data.total.toLocaleString()}
                       </div>
                       <div className="w-full bg-[var(--success)] rounded-t-sm transition-all duration-300 opacity-80" style={{ height: `${heightPct}%` }}>
                       </div>
                    </div>
                  )
               })}
             </div>
             <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2 font-mono">
               <span>Year 0</span>
               <span>Year {years}</span>
             </div>
          </div>
        </div>
      </div>

      <div className={card} style={cardStyle}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Investing Vocabulary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOCABULARY.map((item, idx) => (
             <div key={idx} className="p-3 bg-[rgba(255,255,255,0.02)] rounded border border-[var(--card-border)]">
               <h4 className="text-[0.95rem] font-bold text-[var(--accent)] mb-1">{item.term}</h4>
               <p className="text-[0.85rem] text-[var(--text-secondary)] leading-relaxed m-0">{item.definition}</p>
             </div>
          ))}
        </div>
      </div>

      <div className={card} style={cardStyle}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Daily Tips & Tricks</h2>
        </div>
        <div className="flex flex-col gap-3">
          {randomTips.map((tip, idx) => (
             <div key={idx} className="p-4 bg-[rgba(255,255,255,0.03)] border-l-2 border-l-[var(--accent)] rounded-r flex gap-3 text-sm text-[var(--text-secondary)]">
               <span className="text-[var(--accent)] font-bold shrink-0">💡</span> 
               <span>{tip}</span>
             </div>
          ))}
        </div>
      </div>
    </section>
  )
}
