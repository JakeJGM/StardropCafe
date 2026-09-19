package com.example.stardropcafe.dto;

public record CreateBeverageRequestDTO(
        String name,
        String type,
        String temperature
) {
}
