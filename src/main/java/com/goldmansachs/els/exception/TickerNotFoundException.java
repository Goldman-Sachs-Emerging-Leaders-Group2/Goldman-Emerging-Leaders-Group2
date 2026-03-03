package com.goldmansachs.els.exception;

public class TickerNotFoundException extends RuntimeException {
    public TickerNotFoundException(String ticker) {
        super("Ticker '" + ticker + "' is not supported.");
    }
}
