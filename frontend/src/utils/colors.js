const FUND_COLORS = ['#2E6B9E', '#B5985A', '#0EA5A1', '#8B5CF6', '#E87040']

export const getFundColor = (index) => FUND_COLORS[index % FUND_COLORS.length]
