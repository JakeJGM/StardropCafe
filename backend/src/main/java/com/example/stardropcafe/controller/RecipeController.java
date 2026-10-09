package com.example.stardropcafe.controller;

import com.example.stardropcafe.dto.RecipeRequestDTO;
import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.dto.RecipeResponseDTO;
import com.example.stardropcafe.service.RecipeService;
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
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public PageResponseDTO<RecipeResponseDTO> getRecipes(
            @ParameterObject @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return recipeService.findAllRecipeResponses(pageable);
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

    @PostMapping("/beverage/{beverageId}")
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeResponseDTO createRecipeForBeverage(
            @PathVariable UUID beverageId,
            @RequestBody RecipeRequestDTO request) {
        return recipeService.createForBeverage(beverageId, request);
    }

    @PutMapping("/{id}")
    public RecipeResponseDTO updateRecipe(@PathVariable UUID id, @RequestBody RecipeRequestDTO request) {
        return recipeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRecipe(@PathVariable UUID id) {
        recipeService.delete(id);
    }
}
