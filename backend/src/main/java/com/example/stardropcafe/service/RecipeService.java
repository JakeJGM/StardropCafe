package com.example.stardropcafe.service;

import com.example.stardropcafe.dto.RecipeRequestDTO;
import com.example.stardropcafe.dto.RecipeRequestDTO.IngredientRequestDTO;
import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.dto.RecipeResponseDTO;
import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.entity.Ingredient;
import com.example.stardropcafe.entity.Instruction;
import com.example.stardropcafe.entity.Recipe;
import com.example.stardropcafe.repository.BeverageRepository;
import com.example.stardropcafe.repository.IngredientRepository;
import com.example.stardropcafe.repository.InstructionRepository;
import com.example.stardropcafe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final BeverageRepository beverageRepository;
    private final IngredientRepository ingredientRepository;
    private final InstructionRepository instructionRepository;

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

    @Transactional
    public RecipeResponseDTO createForBeverage(UUID beverageId, RecipeRequestDTO request) {
        Beverage beverage = beverageRepository.findById(beverageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beverage not found"));
        if (beverage.getRecipe() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Beverage already has a recipe");
        }

        Recipe recipe = recipeRepository.save(new Recipe());
        recipe.setBeverage(beverage);
        beverage.setRecipe(recipe);
        replaceIngredientsAndInstructions(recipe, request);

        return RecipeResponseDTO.from(recipe);
    }

    /**
     * Replaces the recipe's ingredients and instructions wholesale with those in the request.
     */
    @Transactional
    public RecipeResponseDTO update(UUID id, RecipeRequestDTO request) {
        Recipe recipe = findOrThrow(id);
        replaceIngredientsAndInstructions(recipe, request);
        return RecipeResponseDTO.from(recipe);
    }

    @Transactional
    public void delete(UUID id) {
        Recipe recipe = findOrThrow(id);
        if (recipe.getBeverage() != null) {
            recipe.getBeverage().setRecipe(null);
        }
        delete(recipe);
    }

    /**
     * Deletes a recipe and its ingredients and instructions. Callers must first
     * detach or delete the beverage, which holds the foreign key to the recipe.
     */
    @Transactional
    public void delete(Recipe recipe) {
        ingredientRepository.deleteAll(recipe.getIngredients());
        instructionRepository.deleteAll(recipe.getInstructions());
        recipeRepository.delete(recipe);
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

    private Recipe findOrThrow(UUID id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
    }

    private void replaceIngredientsAndInstructions(Recipe recipe, RecipeRequestDTO request) {
        List<IngredientRequestDTO> ingredientRequests = request.ingredients() == null ? List.of() : request.ingredients();
        List<String> instructionTexts = request.instructions() == null ? List.of() : request.instructions();
        validateRecipe(ingredientRequests, instructionTexts);

        ingredientRepository.deleteAll(recipe.getIngredients());
        instructionRepository.deleteAll(recipe.getInstructions());
        recipe.getIngredients().clear();
        recipe.getInstructions().clear();

        List<Ingredient> ingredients = new ArrayList<>();
        for (IngredientRequestDTO ingredientRequest : ingredientRequests) {
            Ingredient ingredient = new Ingredient();
            ingredient.setUnitCount(ingredientRequest.unitCount());
            ingredient.setUnitType(ingredientRequest.unitType().trim());
            ingredient.setName(ingredientRequest.name().trim());
            ingredient.setRecipe(recipe);
            ingredients.add(ingredient);
        }

        List<Instruction> instructions = new ArrayList<>();
        for (int i = 0; i < instructionTexts.size(); i++) {
            Instruction instruction = new Instruction();
            instruction.setStep(i + 1);
            instruction.setInstruction(instructionTexts.get(i).trim());
            instruction.setRecipe(recipe);
            instructions.add(instruction);
        }

        // Keep both sides of each relationship in sync so the response reflects
        // what was just saved without reloading the recipe.
        recipe.getIngredients().addAll(ingredientRepository.saveAll(ingredients));
        recipe.getInstructions().addAll(instructionRepository.saveAll(instructions));
    }

    private void validateRecipe(List<IngredientRequestDTO> ingredients, List<String> instructions) {
        if (ingredients.isEmpty()) {
            throw new IllegalArgumentException("Recipe must have at least one ingredient");
        }

        for (IngredientRequestDTO ingredient : ingredients) {
            if (ingredient.unitCount() == null || ingredient.unitCount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Ingredient unit count must be greater than 0");
            }
            if (ingredient.unitType() == null || ingredient.unitType().isBlank()) {
                throw new IllegalArgumentException("Ingredient unit type is required");
            }
            if (ingredient.name() == null || ingredient.name().isBlank()) {
                throw new IllegalArgumentException("Ingredient name is required");
            }
        }

        if (instructions.stream().anyMatch(instruction -> instruction == null || instruction.isBlank())) {
            throw new IllegalArgumentException("Instructions cannot be blank");
        }
    }
}
