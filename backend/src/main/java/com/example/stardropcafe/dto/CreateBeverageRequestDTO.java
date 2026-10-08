package com.example.stardropcafe.dto;

import java.util.List;
import java.util.UUID;

/**
 * A beverage is described by 1-3 contents, drawn from existing contents
 * ({@code beverageContentIds}) and/or new ones created by name
 * ({@code newBeverageContentNames}).
 */
public record CreateBeverageRequestDTO(
        String name,
        String type,
        String temperature,
        List<UUID> beverageContentIds,
        List<String> newBeverageContentNames
) {
}
