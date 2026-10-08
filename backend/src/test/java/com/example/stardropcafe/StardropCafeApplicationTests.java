package com.example.stardropcafe;

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
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.containsInAnyOrder;
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
        // Bulk deletes skip loading entities, which would otherwise trip over
        // recipes whose beverage was deleted a statement earlier.
        beverageRepository.deleteAllInBatch();
        beverageContentRepository.deleteAllInBatch();
        ingredientRepository.deleteAllInBatch();
        instructionRepository.deleteAllInBatch();
        recipeRepository.deleteAllInBatch();
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
                  "temperature": "hot",
                  "newBeverageContentNames": ["Espresso"]
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
                .andExpect(jsonPath("$.beverageContents", hasSize(1)))
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
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Green Tea"))
                .andExpect(jsonPath("$.content[0].type").value("Tea"))
                .andExpect(jsonPath("$.content[0].temperature").value("iced"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void paginatesBeverages() throws Exception {
        for (int i = 0; i < 3; i++) {
            Beverage beverage = new Beverage();
            beverage.setName("Beverage " + i);
            beverage.setType("Coffee");
            beverage.setTemperature("hot");
            beverageRepository.save(beverage);
        }

        mockMvc.perform(get("/beverages").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false));

        mockMvc.perform(get("/beverages").param("page", "1").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void sortsBeveragesByRequestedField() throws Exception {
        Beverage zebra = new Beverage();
        zebra.setName("Zebra Mocha");
        zebra.setType("Coffee");
        zebra.setTemperature("hot");
        beverageRepository.save(zebra);

        Beverage apple = new Beverage();
        apple.setName("Apple Cider Latte");
        apple.setType("Coffee");
        apple.setTemperature("hot");
        beverageRepository.save(apple);

        mockMvc.perform(get("/beverages").param("sort", "name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].name").value("Apple Cider Latte"))
                .andExpect(jsonPath("$.content[1].name").value("Zebra Mocha"));
    }

    @Test
    void retrievesBeverageById() throws Exception {
        BeverageContent chocolateSyrup = new BeverageContent();
        chocolateSyrup.setName("Chocolate syrup");
        BeverageContent savedContent = beverageContentRepository.save(chocolateSyrup);

        Beverage beverage = new Beverage();
        beverage.setName("Mocha");
        beverage.setType("Coffee");
        beverage.setTemperature("hot");
        beverage.setBeverageContents(Set.of(savedContent));
        Beverage savedBeverage = beverageRepository.save(beverage);

        mockMvc.perform(get("/beverages/{id}", savedBeverage.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedBeverage.getId().toString()))
                .andExpect(jsonPath("$.name").value("Mocha"))
                .andExpect(jsonPath("$.beverageContents", hasSize(1)))
                .andExpect(jsonPath("$.beverageContents[0].id").value(savedContent.getId().toString()))
                .andExpect(jsonPath("$.beverageContents[0].name").value("Chocolate syrup"));
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
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id").value(recipe.getId().toString()))
                .andExpect(jsonPath("$.content[0].ingredients", hasSize(2)))
                .andExpect(jsonPath("$.content[0].ingredients[0].name").value("Espresso"))
                .andExpect(jsonPath("$.content[0].ingredients[0].unitType").value("shot"))
                .andExpect(jsonPath("$.content[0].ingredients[0].unitCount").value(2))
                .andExpect(jsonPath("$.content[0].instructions", hasSize(2)))
                .andExpect(jsonPath("$.content[0].instructions[0].step").value(1))
                .andExpect(jsonPath("$.content[0].instructions[0].instruction").value("Pull espresso shots."))
                .andExpect(jsonPath("$.content[0].instructions[1].step").value(2))
                .andExpect(jsonPath("$.content[0].instructions[1].instruction").value("Steam milk."))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void retrievesBeverageOptions() throws Exception {
        mockMvc.perform(get("/beverages/options"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.types", hasSize(5)))
                .andExpect(jsonPath("$.temperatures", hasSize(3)))
                .andExpect(jsonPath("$.temperatures[0]").value("hot"));
    }

    @Test
    void retrievesBeverageContentsSortedByName() throws Exception {
        beverageContentRepository.saveAll(List.of(beverageContent("Milk"), beverageContent("Espresso")));

        mockMvc.perform(get("/beverage-contents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Espresso"))
                .andExpect(jsonPath("$[1].name").value("Milk"));
    }

    @Test
    void createsBeverageWithExistingAndNewContents() throws Exception {
        BeverageContent milk = beverageContentRepository.save(beverageContent("Milk"));

        // "milk" matches an existing content ignoring case, so it is reused rather than duplicated.
        String request = """
                {
                  "name": "Honey Latte",
                  "type": "Coffee",
                  "temperature": "iced",
                  "beverageContentIds": ["%s"],
                  "newBeverageContentNames": ["Honey", "milk", "  "]
                }
                """.formatted(milk.getId());

        mockMvc.perform(post("/beverages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.beverageContents", hasSize(2)))
                .andExpect(jsonPath("$.beverageContents[*].name", containsInAnyOrder("Milk", "Honey")));

        mockMvc.perform(get("/beverage-contents"))
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void rejectsBeverageWithoutContents() throws Exception {
        String request = """
                {
                  "name": "Plain Coffee",
                  "type": "Coffee",
                  "temperature": "hot"
                }
                """;

        mockMvc.perform(post("/beverages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Beverage must have between 1 and 3 contents"));
    }

    @Test
    void rejectsBeverageWithTooManyContents() throws Exception {
        String request = """
                {
                  "name": "Kitchen Sink",
                  "type": "Coffee",
                  "temperature": "hot",
                  "newBeverageContentNames": ["A", "B", "C", "D"]
                }
                """;

        mockMvc.perform(post("/beverages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/beverage-contents"))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void createsRecipeForBeverage() throws Exception {
        Beverage beverage = beverageRepository.save(beverage("Stardrop Latte"));

        String request = """
                {
                  "ingredients": [
                    {"unitCount": 2, "unitType": "shot", "name": "Espresso"},
                    {"unitCount": 1.5, "unitType": "cup", "name": "Steamed milk"}
                  ],
                  "instructions": ["Pull two shots.", "Steam the milk and combine."]
                }
                """;

        mockMvc.perform(post("/recipes/beverage/{beverageId}", beverage.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.beverageId").value(beverage.getId().toString()))
                .andExpect(jsonPath("$.ingredients", hasSize(2)))
                .andExpect(jsonPath("$.ingredients[1].unitCount").value(1.5))
                .andExpect(jsonPath("$.instructions", hasSize(2)))
                .andExpect(jsonPath("$.instructions[0].step").value(1))
                .andExpect(jsonPath("$.instructions[1].instruction").value("Steam the milk and combine."));

        mockMvc.perform(get("/recipes/beverage/{beverageId}", beverage.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredients", hasSize(2)));
        mockMvc.perform(get("/beverages/{id}", beverage.getId()))
                .andExpect(jsonPath("$.recipeId").isNotEmpty());
    }

    @Test
    void createsRecipeWithoutInstructions() throws Exception {
        Beverage beverage = beverageRepository.save(beverage("Iced Tea"));

        String request = """
                {"ingredients": [{"unitCount": 1, "unitType": "cup", "name": "Black tea"}]}
                """;

        mockMvc.perform(post("/recipes/beverage/{beverageId}", beverage.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.instructions", hasSize(0)));
    }

    @Test
    void rejectsSecondRecipeForBeverage() throws Exception {
        Beverage beverage = beverageRepository.save(beverage("Stardrop Latte"));
        String request = """
                {"ingredients": [{"unitCount": 2, "unitType": "shot", "name": "Espresso"}]}
                """;

        mockMvc.perform(post("/recipes/beverage/{beverageId}", beverage.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/recipes/beverage/{beverageId}", beverage.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Beverage already has a recipe"));
    }

    @Test
    void rejectsRecipeWithInvalidIngredient() throws Exception {
        Beverage beverage = beverageRepository.save(beverage("Stardrop Latte"));
        String request = """
                {"ingredients": [{"unitCount": 0, "unitType": "shot", "name": "Espresso"}]}
                """;

        mockMvc.perform(post("/recipes/beverage/{beverageId}", beverage.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ingredient unit count must be greater than 0"));
    }

    @Test
    void returnsNotFoundWhenCreatingRecipeForMissingBeverage() throws Exception {
        mockMvc.perform(post("/recipes/beverage/{beverageId}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ingredients": [{"unitCount": 1, "unitType": "cup", "name": "Milk"}]}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Beverage not found"));
    }

    private Beverage beverage(String name) {
        Beverage beverage = new Beverage();
        beverage.setName(name);
        beverage.setType("Coffee");
        beverage.setTemperature("hot");
        return beverage;
    }

    private BeverageContent beverageContent(String name) {
        BeverageContent beverageContent = new BeverageContent();
        beverageContent.setName(name);
        return beverageContent;
    }
}
