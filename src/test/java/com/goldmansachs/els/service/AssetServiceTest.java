package com.goldmansachs.els.service;

import com.goldmansachs.els.model.Asset;
import com.goldmansachs.els.model.AssetType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AssetServiceTest {

    private final AssetService service = new AssetService();

    @Test
    void getAllAssets_returnsEightAssets() {
        List<Asset> assets = service.getAllAssets();

        assertEquals(8, assets.size());
        List<String> tickers = assets.stream().map(Asset::ticker).toList();
        assertTrue(tickers.contains("VFIAX"));
        assertTrue(tickers.contains("SPY"));
        assertTrue(tickers.contains("QQQ"));
    }

    @Test
    void getAllAssets_containsBothTypes() {
        List<Asset> assets = service.getAllAssets();

        long mutualFunds = assets.stream().filter(a -> a.type() == AssetType.MUTUAL_FUND).count();
        long etfs = assets.stream().filter(a -> a.type() == AssetType.ETF).count();

        assertEquals(5, mutualFunds);
        assertEquals(3, etfs);
    }

    @Test
    void getAssetByTicker_returnsMutualFund() {
        Asset asset = service.getAssetByTicker("VFIAX");

        assertEquals("VFIAX", asset.ticker());
        assertEquals("Vanguard 500 Index Fund", asset.name());
        assertEquals(AssetType.MUTUAL_FUND, asset.type());
        assertEquals(0.1553, asset.expectedAnnualReturn(), 1e-6);
    }

    @Test
    void getAssetByTicker_returnsETF() {
        Asset asset = service.getAssetByTicker("SPY");

        assertEquals("SPY", asset.ticker());
        assertEquals("SPDR S&P 500 ETF Trust", asset.name());
        assertEquals(AssetType.ETF, asset.type());
    }

    @Test
    void getAssetByTicker_isCaseInsensitive() {
        Asset asset = service.getAssetByTicker("spy");

        assertEquals("SPY", asset.ticker());
    }

    @Test
    void getAssetByTicker_throwsForUnknownTicker() {
        assertThrows(IllegalArgumentException.class, () -> service.getAssetByTicker("UNKNOWN"));
    }
}
