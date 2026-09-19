package com.example.stardropcafe.controller;

import com.example.stardropcafe.dto.RecipeResponseDTO;
import com.example.stardropcafe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public List<RecipeResponseDTO> getRecipes() {
        return recipeService.findAllRecipeResponses();
    }
}
