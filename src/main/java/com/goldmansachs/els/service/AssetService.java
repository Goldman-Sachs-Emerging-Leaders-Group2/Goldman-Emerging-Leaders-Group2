package com.goldmansachs.els.service;

import com.goldmansachs.els.model.Asset;
import com.goldmansachs.els.model.AssetType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final List<Asset> assets = List.of(
            // Mutual Funds
            new Asset("VFIAX", "Vanguard 500 Index Fund", AssetType.MUTUAL_FUND, 0.1553),
            new Asset("FXAIX", "Fidelity 500 Index Fund", AssetType.MUTUAL_FUND, 0.1556),
            new Asset("AGTHX", "American Funds Growth Fund of America", AssetType.MUTUAL_FUND, 0.1515),
            new Asset("FCNTX", "Fidelity Contrafund", AssetType.MUTUAL_FUND, 0.1776),
            new Asset("TRBCX", "T. Rowe Price Blue Chip Growth", AssetType.MUTUAL_FUND, 0.1649),
            // ETFs
            new Asset("SPY", "SPDR S&P 500 ETF Trust", AssetType.ETF, 0.1548),
            new Asset("QQQ", "Invesco QQQ Trust", AssetType.ETF, 0.1892),
            new Asset("VTI", "Vanguard Total Stock Market ETF", AssetType.ETF, 0.1465)
    );

    public List<Asset> getAllAssets() {
        return assets;
    }

    public Asset getAssetByTicker(String ticker) {
        return assets.stream()
                .filter(asset -> asset.ticker().equalsIgnoreCase(ticker))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + ticker));
    }
}
