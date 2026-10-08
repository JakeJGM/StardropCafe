package com.example.stardropcafe.service;

import com.example.stardropcafe.dto.BeverageOptionsResponseDTO;
import com.example.stardropcafe.dto.BeverageResponseDTO;
import com.example.stardropcafe.dto.CreateBeverageRequestDTO;
import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.entity.BeverageContent;
import com.example.stardropcafe.repository.BeverageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BeverageService {

    private static final List<String> ALLOWED_TYPES = List.of("Coffee", "Tea", "Spirit", "Matcha", "Dirty Soda");
    private static final List<String> ALLOWED_TEMPERATURES = List.of("hot", "iced", "cold");
    private static final int MIN_CONTENTS = 1;
    private static final int MAX_CONTENTS = 3;

    private final BeverageRepository beverageRepository;
    private final BeverageContentService beverageContentService;

    public BeverageOptionsResponseDTO getOptions() {
        return new BeverageOptionsResponseDTO(ALLOWED_TYPES, ALLOWED_TEMPERATURES);
    }

    @Transactional
    public BeverageResponseDTO create(CreateBeverageRequestDTO request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Beverage name is required");
        }
        validateBeverage(request.type(), request.temperature());

        Beverage beverage = new Beverage();
        beverage.setName(request.name().trim());
        beverage.setType(request.type());
        beverage.setTemperature(request.temperature());
        beverage.setBeverageContents(resolveBeverageContents(request));

        return BeverageResponseDTO.from(beverageRepository.save(beverage));
    }

    public PageResponseDTO<BeverageResponseDTO> findAllBeverageResponses(Pageable pageable) {
        return PageResponseDTO.from(beverageRepository.findAll(pageable)
                .map(BeverageResponseDTO::from));
    }

    public Optional<BeverageResponseDTO> findBeverageResponseById(UUID id) {
        return beverageRepository.findById(id)
                .map(BeverageResponseDTO::from);
    }

    public Beverage save(Beverage beverage) {
        validateBeverage(beverage.getType(), beverage.getTemperature());
        return beverageRepository.save(beverage);
    }

    public List<Beverage> findAll() {
        return beverageRepository.findAll();
    }

    public Optional<Beverage> findById(UUID id) {
        return beverageRepository.findById(id);
    }

    public void deleteById(UUID id) {
        beverageRepository.deleteById(id);
    }

    private Set<BeverageContent> resolveBeverageContents(CreateBeverageRequestDTO request) {
        Set<UUID> ids = request.beverageContentIds() == null
                ? Set.of()
                : new HashSet<>(request.beverageContentIds());
        List<BeverageContent> existing = beverageContentService.findAllById(ids);
        if (existing.size() != ids.size()) {
            throw new IllegalArgumentException("One or more beverage contents do not exist");
        }

        // Keyed by lowercase name so "Milk" and "milk" collapse to one entry.
        Set<String> seenNames = new HashSet<>();
        existing.forEach(content -> seenNames.add(content.getName().toLowerCase(Locale.ROOT)));
        Set<String> newNames = new LinkedHashSet<>();
        if (request.newBeverageContentNames() != null) {
            for (String name : request.newBeverageContentNames()) {
                if (name != null && !name.isBlank() && seenNames.add(name.trim().toLowerCase(Locale.ROOT))) {
                    newNames.add(name.trim());
                }
            }
        }

        int total = existing.size() + newNames.size();
        if (total < MIN_CONTENTS || total > MAX_CONTENTS) {
            throw new IllegalArgumentException(
                    "Beverage must have between " + MIN_CONTENTS + " and " + MAX_CONTENTS + " contents");
        }

        Set<BeverageContent> contents = new HashSet<>(existing);
        newNames.forEach(name -> contents.add(beverageContentService.findOrCreateByName(name)));
        return contents;
    }

    private void validateBeverage(String type, String temperature) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException("Beverage type must be one of: " + String.join(", ", ALLOWED_TYPES));
        }

        if (!ALLOWED_TEMPERATURES.contains(temperature)) {
            throw new IllegalArgumentException("Beverage temperature must be one of: " + String.join(", ", ALLOWED_TEMPERATURES));
        }
    }
}
