package com.example.stardropcafe.service;

import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.repository.BeverageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BeverageService {

    private final BeverageRepository beverageRepository;

    public Beverage save(Beverage beverage) {
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
}
