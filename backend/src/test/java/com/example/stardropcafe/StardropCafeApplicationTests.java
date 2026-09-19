package com.example.stardropcafe;

import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.entity.Ingredient;
import com.example.stardropcafe.entity.Instruction;
import com.example.stardropcafe.entity.Recipe;
import com.example.stardropcafe.repository.BeverageContentRepository;
import com.example.stardropcafe.repository.BeverageRepository;
import com.example.stardropcafe.repository.IngredientRepository;
import com.example.stardropcafe.repository.InstructionRepository;
import com.example.stardropcafe.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class StardropCafeApplicationTests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private BeverageRepository beverageRepository;

    @Autowired
    private BeverageContentRepository beverageContentRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private InstructionRepository instructionRepository;

    @BeforeEach
    void setUp() {
        beverageRepository.deleteAll();
        beverageContentRepository.deleteAll();
        ingredientRepository.deleteAll();
        instructionRepository.deleteAll();
        recipeRepository.deleteAll();
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void contextLoads() {
    }

    @Test
    void createsBeverage() throws Exception {
        String request = """
                {
                  "name": "Stardrop Latte",
                  "type": "Coffee",
                  "temperature": "hot"
                }
                """;

        mockMvc.perform(post("/beverages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Stardrop Latte"))
                .andExpect(jsonPath("$.type").value("Coffee"))
                .andExpect(jsonPath("$.temperature").value("hot"))
                .andExpect(jsonPath("$.beverageContentIds", hasSize(0)))
                .andExpect(jsonPath("$.recipeId").doesNotExist());
    }

    @Test
    void retrievesBeverages() throws Exception {
        Beverage beverage = new Beverage();
        beverage.setName("Green Tea");
        beverage.setType("Tea");
        beverage.setTemperature("iced");
        beverageRepository.save(beverage);

        mockMvc.perform(get("/beverages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Green Tea"))
                .andExpect(jsonPath("$[0].type").value("Tea"))
                .andExpect(jsonPath("$[0].temperature").value("iced"));
    }

    @Test
    void retrievesBeverageById() throws Exception {
        Beverage beverage = new Beverage();
        beverage.setName("Mocha");
        beverage.setType("Coffee");
        beverage.setTemperature("hot");
        Beverage savedBeverage = beverageRepository.save(beverage);

        mockMvc.perform(get("/beverages/{id}", savedBeverage.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedBeverage.getId().toString()))
                .andExpect(jsonPath("$.name").value("Mocha"));
    }

    @Test
    void returnsNotFoundForMissingBeverage() throws Exception {
        mockMvc.perform(get("/beverages/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsInvalidBeverageType() throws Exception {
        String request = """
                {
                  "name": "Berry Fizz",
                  "type": "Soda",
                  "temperature": "cold"
                }
                """;

        mockMvc.perform(post("/beverages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Beverage type must be one of: Coffee, Tea, Spirit, Matcha, Dirty Soda"));
    }

    @Test
    void rejectsInvalidBeverageTemperature() throws Exception {
        String request = """
                {
                  "name": "Room Temp Coffee",
                  "type": "Coffee",
                  "temperature": "warm"
                }
                """;

        mockMvc.perform(post("/beverages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Beverage temperature must be one of: hot, iced, cold"));
    }

    @Test
    void retrievesRecipesWithIngredientsAndInstructions() throws Exception {
        Recipe recipe = recipeRepository.save(new Recipe());

        Ingredient espresso = new Ingredient();
        espresso.setName("Espresso");
        espresso.setUnitType("shot");
        espresso.setUnitCount(new BigDecimal("2"));
        espresso.setRecipe(recipe);

        Ingredient milk = new Ingredient();
        milk.setName("Steamed milk");
        milk.setUnitType("cup");
        milk.setUnitCount(new BigDecimal("1.5"));
        milk.setRecipe(recipe);

        ingredientRepository.saveAll(List.of(espresso, milk));

        Instruction secondStep = new Instruction();
        secondStep.setStep(2);
        secondStep.setInstruction("Steam milk.");
        secondStep.setRecipe(recipe);

        Instruction firstStep = new Instruction();
        firstStep.setStep(1);
        firstStep.setInstruction("Pull espresso shots.");
        firstStep.setRecipe(recipe);

        instructionRepository.saveAll(List.of(secondStep, firstStep));

        mockMvc.perform(get("/recipes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(recipe.getId().toString()))
                .andExpect(jsonPath("$[0].ingredients", hasSize(2)))
                .andExpect(jsonPath("$[0].ingredients[0].name").value("Espresso"))
                .andExpect(jsonPath("$[0].ingredients[0].unitType").value("shot"))
                .andExpect(jsonPath("$[0].ingredients[0].unitCount").value(2))
                .andExpect(jsonPath("$[0].instructions", hasSize(2)))
                .andExpect(jsonPath("$[0].instructions[0].step").value(1))
                .andExpect(jsonPath("$[0].instructions[0].instruction").value("Pull espresso shots."))
                .andExpect(jsonPath("$[0].instructions[1].step").value(2))
                .andExpect(jsonPath("$[0].instructions[1].instruction").value("Steam milk."));
    }
}
