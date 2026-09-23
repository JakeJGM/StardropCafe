package com.example.stardropcafe.service;

import com.example.stardropcafe.dto.BeverageResponseDTO;
import com.example.stardropcafe.dto.CreateBeverageRequestDTO;
import com.example.stardropcafe.dto.PageResponseDTO;
import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.repository.BeverageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BeverageService {

    private static final List<String> ALLOWED_TYPES = List.of("Coffee", "Tea", "Spirit", "Matcha", "Dirty Soda");
    private static final List<String> ALLOWED_TEMPERATURES = List.of("hot", "iced", "cold");

    private final BeverageRepository beverageRepository;

    public BeverageResponseDTO create(CreateBeverageRequestDTO request) {
        validateBeverage(request.type(), request.temperature());

        Beverage beverage = new Beverage();
        beverage.setName(request.name());
        beverage.setType(request.type());
        beverage.setTemperature(request.temperature());

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

    private void validateBeverage(String type, String temperature) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException("Beverage type must be one of: " + String.join(", ", ALLOWED_TYPES));
        }

        if (!ALLOWED_TEMPERATURES.contains(temperature)) {
            throw new IllegalArgumentException("Beverage temperature must be one of: " + String.join(", ", ALLOWED_TEMPERATURES));
        }
    }
}
