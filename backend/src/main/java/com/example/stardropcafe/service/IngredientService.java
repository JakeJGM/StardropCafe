package com.example.stardropcafe.service;

import com.example.stardropcafe.entity.Ingredient;
import com.example.stardropcafe.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public Ingredient save(Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }

    public List<Ingredient> findAll() {
        return ingredientRepository.findAll();
    }

    public Optional<Ingredient> findById(UUID id) {
        return ingredientRepository.findById(id);
    }

    public void deleteById(UUID id) {
        ingredientRepository.deleteById(id);
    }
}
