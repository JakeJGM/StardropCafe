package com.example.stardropcafe.repository;

import com.example.stardropcafe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    Optional<Recipe> findByBeverageId(UUID beverageId);
}
