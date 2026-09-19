package com.example.stardropcafe;

import com.example.stardropcafe.entity.Beverage;
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
}
