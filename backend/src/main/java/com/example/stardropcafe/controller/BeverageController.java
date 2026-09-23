package com.example.stardropcafe.controller;

import com.example.stardropcafe.dto.BeverageResponseDTO;
import com.example.stardropcafe.dto.CreateBeverageRequestDTO;
import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.service.BeverageService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/beverages")
@RequiredArgsConstructor
public class BeverageController {

    private final BeverageService beverageService;

    @GetMapping
    public PageResponseDTO<BeverageResponseDTO> getBeverages(
            @ParameterObject @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return beverageService.findAllBeverageResponses(pageable);
    }

    @GetMapping("/{id}")
    public BeverageResponseDTO getBeverage(@PathVariable UUID id) {
        return beverageService.findBeverageResponseById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beverage not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeverageResponseDTO createBeverage(@RequestBody CreateBeverageRequestDTO request) {
        return beverageService.create(request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleIllegalArgument(IllegalArgumentException exception) {
        return Map.of("message", exception.getMessage());
    }
}
