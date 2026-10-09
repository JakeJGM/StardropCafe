package com.example.stardropcafe.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Instructions are plain text; their step numbers come from their order in the list.
 */
public record RecipeRequestDTO(
        List<IngredientRequestDTO> ingredients,
        List<String> instructions
) {

    public record IngredientRequestDTO(
            BigDecimal unitCount,
            String unitType,
            String name
    ) {
    }
}
