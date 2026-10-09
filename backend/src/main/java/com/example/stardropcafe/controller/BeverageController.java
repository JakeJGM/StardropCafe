package com.example.stardropcafe.controller;

import com.example.stardropcafe.dto.BeverageOptionsResponseDTO;
import com.example.stardropcafe.dto.BeverageResponseDTO;
import com.example.stardropcafe.dto.BeverageRequestDTO;
import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.service.BeverageService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/options")
    public BeverageOptionsResponseDTO getBeverageOptions() {
        return beverageService.getOptions();
    }

    @GetMapping("/{id}")
    public BeverageResponseDTO getBeverage(@PathVariable UUID id) {
        return beverageService.findBeverageResponseById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beverage not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeverageResponseDTO createBeverage(@RequestBody BeverageRequestDTO request) {
        return beverageService.create(request);
    }

    @PutMapping("/{id}")
    public BeverageResponseDTO updateBeverage(@PathVariable UUID id, @RequestBody BeverageRequestDTO request) {
        return beverageService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBeverage(@PathVariable UUID id) {
        beverageService.delete(id);
    }
}
