package com.example.stardropcafe.dto;

import com.example.stardropcafe.entity.Ingredient;
import com.example.stardropcafe.entity.Instruction;
import com.example.stardropcafe.entity.Recipe;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record RecipeResponseDTO(
        UUID id,
        UUID beverageId,
        List<IngredientResponseDTO> ingredients,
        List<InstructionResponseDTO> instructions
) {

    public static RecipeResponseDTO from(Recipe recipe) {
        UUID beverageId = recipe.getBeverage() == null ? null : recipe.getBeverage().getId();
        List<IngredientResponseDTO> ingredients = recipe.getIngredients()
                .stream()
                .map(IngredientResponseDTO::from)
                .toList();
        List<InstructionResponseDTO> instructions = recipe.getInstructions()
                .stream()
                .map(InstructionResponseDTO::from)
                .sorted(Comparator.comparing(InstructionResponseDTO::step))
                .toList();

        return new RecipeResponseDTO(recipe.getId(), beverageId, ingredients, instructions);
    }

    public record IngredientResponseDTO(
            UUID id,
            String name,
            String unitType,
            BigDecimal unitCount
    ) {

        public static IngredientResponseDTO from(Ingredient ingredient) {
            return new IngredientResponseDTO(
                    ingredient.getId(),
                    ingredient.getName(),
                    ingredient.getUnitType(),
                    ingredient.getUnitCount()
            );
        }
    }

    public record InstructionResponseDTO(
            UUID id,
            Integer step,
            String instruction
    ) {

        public static InstructionResponseDTO from(Instruction instruction) {
            return new InstructionResponseDTO(
                    instruction.getId(),
                    instruction.getStep(),
                    instruction.getInstruction()
            );
        }
    }
}
