const FUND_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6']

export const getFundColor = (index) => FUND_COLORS[index % FUND_COLORS.length]
