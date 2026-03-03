package com.goldmansachs.els.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

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
}
