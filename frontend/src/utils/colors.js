export const FUND_COLORS = ['#16324F', '#2F6F6D', '#C8A56A', '#5D7A99', '#7B8E62']

export const getFundColor = (index) => FUND_COLORS[index % FUND_COLORS.length]
