const ASSET_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6']

export const getAssetColor = (index) => ASSET_COLORS[index % ASSET_COLORS.length]
