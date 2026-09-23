package com.example.stardropcafe.dto;

import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.entity.BeverageContent;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record BeverageResponseDTO(
        UUID id,
        String name,
        String type,
        String temperature,
        Set<BeverageContentResponseDTO> beverageContents,
        UUID recipeId
) {

    public static BeverageResponseDTO from(Beverage beverage) {
        UUID recipeId = beverage.getRecipe() == null ? null : beverage.getRecipe().getId();
        Set<BeverageContentResponseDTO> beverageContents = beverage.getBeverageContents()
                .stream()
                .map(BeverageContentResponseDTO::from)
                .collect(Collectors.toSet());

        return new BeverageResponseDTO(
                beverage.getId(),
                beverage.getName(),
                beverage.getType(),
                beverage.getTemperature(),
                beverageContents,
                recipeId
        );
    }

    public record BeverageContentResponseDTO(
            UUID id,
            String name
    ) {

        public static BeverageContentResponseDTO from(BeverageContent beverageContent) {
            return new BeverageContentResponseDTO(
                    beverageContent.getId(),
                    beverageContent.getName()
            );
        }
    }
}
