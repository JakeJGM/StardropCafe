package com.example.stardropcafe.service;

import com.example.stardropcafe.entity.Recipe;
import com.example.stardropcafe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;

    public Recipe save(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public List<Recipe> findAll() {
        return recipeRepository.findAll();
    }

    public Optional<Recipe> findById(UUID id) {
        return recipeRepository.findById(id);
    }

    public void deleteById(UUID id) {
        recipeRepository.deleteById(id);
    }
}
