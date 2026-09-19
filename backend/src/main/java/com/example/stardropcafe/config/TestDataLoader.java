package com.example.stardropcafe.config;

import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.entity.BeverageContent;
import com.example.stardropcafe.entity.Ingredient;
import com.example.stardropcafe.entity.Instruction;
import com.example.stardropcafe.entity.Recipe;
import com.example.stardropcafe.repository.BeverageContentRepository;
import com.example.stardropcafe.repository.BeverageRepository;
import com.example.stardropcafe.repository.IngredientRepository;
import com.example.stardropcafe.repository.InstructionRepository;
import com.example.stardropcafe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class TestDataLoader implements ApplicationRunner {

    private final BeverageRepository beverageRepository;
    private final BeverageContentRepository beverageContentRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final InstructionRepository instructionRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (hasSeedData()) {
            return;
        }

        BeverageContent coffee = beverageContentRepository.save(beverageContent("Coffee"));
        BeverageContent milk = beverageContentRepository.save(beverageContent("Milk"));
        BeverageContent espresso = beverageContentRepository.save(beverageContent("Espresso"));
        BeverageContent matcha = beverageContentRepository.save(beverageContent("Matcha Powder"));
        BeverageContent citrus = beverageContentRepository.save(beverageContent("Citrus"));
        BeverageContent soda = beverageContentRepository.save(beverageContent("Soda"));
        BeverageContent spirit = beverageContentRepository.save(beverageContent("Spirit Base"));

        Recipe latteRecipe = recipeRepository.save(new Recipe());
        ingredientRepository.saveAll(List.of(
                ingredient("Espresso", "shot", "2", latteRecipe),
                ingredient("Steamed milk", "cup", "1.5", latteRecipe),
                ingredient("Vanilla syrup", "pump", "2", latteRecipe)
        ));
        instructionRepository.saveAll(List.of(
                instruction(1, "Pull two espresso shots.", latteRecipe),
                instruction(2, "Steam milk until glossy.", latteRecipe),
                instruction(3, "Combine espresso, syrup, and milk.", latteRecipe)
        ));

        Recipe matchaRecipe = recipeRepository.save(new Recipe());
        ingredientRepository.saveAll(List.of(
                ingredient("Matcha powder", "teaspoon", "2", matchaRecipe),
                ingredient("Cold milk", "cup", "1", matchaRecipe),
                ingredient("Honey", "tablespoon", "1", matchaRecipe)
        ));
        instructionRepository.saveAll(List.of(
                instruction(1, "Whisk matcha powder with a splash of cold milk.", matchaRecipe),
                instruction(2, "Shake with remaining milk and honey.", matchaRecipe),
                instruction(3, "Serve over ice.", matchaRecipe)
        ));

        Recipe dirtySodaRecipe = recipeRepository.save(new Recipe());
        ingredientRepository.saveAll(List.of(
                ingredient("Cola", "ounce", "8", dirtySodaRecipe),
                ingredient("Coconut cream", "ounce", "1", dirtySodaRecipe),
                ingredient("Lime juice", "ounce", "0.5", dirtySodaRecipe)
        ));
        instructionRepository.saveAll(List.of(
                instruction(1, "Fill glass with ice.", dirtySodaRecipe),
                instruction(2, "Pour cola and lime juice over ice.", dirtySodaRecipe),
                instruction(3, "Top with coconut cream.", dirtySodaRecipe)
        ));

        beverageRepository.saveAll(List.of(
                beverage("Stardrop Latte", "Coffee", "hot", latteRecipe, Set.of(coffee, espresso, milk)),
                beverage("Moonlight Matcha", "Matcha", "iced", matchaRecipe, Set.of(matcha, milk)),
                beverage("Cinder Spirit", "Spirit", "cold", null, Set.of(spirit, citrus)),
                beverage("Saloon Espresso", "Coffee", "hot", null, Set.of(coffee, espresso)),
                beverage("Joja Dirty Soda", "Dirty Soda", "cold", dirtySodaRecipe, Set.of(soda, citrus))
        ));
    }

    private boolean hasSeedData() {
        return beverageRepository.count() > 0
                || beverageContentRepository.count() > 0
                || recipeRepository.count() > 0
                || ingredientRepository.count() > 0
                || instructionRepository.count() > 0;
    }

    private Beverage beverage(String name, String type, String temperature, Recipe recipe, Set<BeverageContent> contents) {
        Beverage beverage = new Beverage();
        beverage.setName(name);
        beverage.setType(type);
        beverage.setTemperature(temperature);
        beverage.setRecipe(recipe);
        beverage.setBeverageContents(contents);
        return beverage;
    }

    private BeverageContent beverageContent(String name) {
        BeverageContent beverageContent = new BeverageContent();
        beverageContent.setName(name);
        return beverageContent;
    }

    private Ingredient ingredient(String name, String unitType, String unitCount, Recipe recipe) {
        Ingredient ingredient = new Ingredient();
        ingredient.setName(name);
        ingredient.setUnitType(unitType);
        ingredient.setUnitCount(new BigDecimal(unitCount));
        ingredient.setRecipe(recipe);
        return ingredient;
    }

    private Instruction instruction(Integer step, String text, Recipe recipe) {
        Instruction instruction = new Instruction();
        instruction.setStep(step);
        instruction.setInstruction(text);
        instruction.setRecipe(recipe);
        return instruction;
    }
}
