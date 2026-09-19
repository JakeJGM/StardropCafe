package com.example.stardropcafe.controller;

import com.example.stardropcafe.dto.RecipeResponseDTO;
import com.example.stardropcafe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public List<RecipeResponseDTO> getRecipes() {
        return recipeService.findAllRecipeResponses();
    }

    @GetMapping("/{id}")
    public RecipeResponseDTO getRecipe(@PathVariable UUID id) {
        return recipeService.findRecipeResponseById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
    }

    @GetMapping("/beverage/{beverageId}")
    public RecipeResponseDTO getRecipeByBeverageId(@PathVariable UUID beverageId) {
        return recipeService.findRecipeResponseByBeverageId(beverageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
    }
}
