package com.goldmansachs.els.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<Map<String, String>> handleInvalidInput(InvalidInputException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_INPUT",
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(Exception ex) {
        String message = "Invalid request parameters.";
        if (ex instanceof MissingServletRequestParameterException missingParamEx) {
            message = "Missing required parameter: " + missingParamEx.getParameterName();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_INPUT",
                        "message", message
                ));
    }

    @ExceptionHandler(TickerNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleTickerNotFound(TickerNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", "TICKER_NOT_FOUND",
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(ExternalApiException.class)
    public ResponseEntity<Map<String, String>> handleExternalApi(ExternalApiException ex) {
        logger.warn("External API failure: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of(
                        "error", "EXTERNAL_API_ERROR",
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
        logger.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "INTERNAL_ERROR",
                        "message", "An unexpected error occurred."
                ));
    }
}
