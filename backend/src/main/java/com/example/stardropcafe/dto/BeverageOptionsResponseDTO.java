package com.example.stardropcafe.dto;

import java.util.List;

public record BeverageOptionsResponseDTO(
        List<String> types,
        List<String> temperatures
) {
}
