package com.example.stardropcafe.service;

import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.dto.RecipeResponseDTO;
import com.example.stardropcafe.entity.Recipe;
import com.example.stardropcafe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;

    @Transactional(readOnly = true)
    public PageResponseDTO<RecipeResponseDTO> findAllRecipeResponses(Pageable pageable) {
        return PageResponseDTO.from(recipeRepository.findAll(pageable)
                .map(RecipeResponseDTO::from));
    }

    @Transactional(readOnly = true)
    public Optional<RecipeResponseDTO> findRecipeResponseById(UUID id) {
        return recipeRepository.findById(id)
                .map(RecipeResponseDTO::from);
    }

    @Transactional(readOnly = true)
    public Optional<RecipeResponseDTO> findRecipeResponseByBeverageId(UUID beverageId) {
        return recipeRepository.findByBeverageId(beverageId)
                .map(RecipeResponseDTO::from);
    }

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
