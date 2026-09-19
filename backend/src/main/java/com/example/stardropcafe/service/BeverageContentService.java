package com.example.stardropcafe.service;

import com.example.stardropcafe.entity.BeverageContent;
import com.example.stardropcafe.repository.BeverageContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BeverageContentService {

    private final BeverageContentRepository beverageContentRepository;

    public BeverageContent save(BeverageContent beverageContent) {
        return beverageContentRepository.save(beverageContent);
    }

    public List<BeverageContent> findAll() {
        return beverageContentRepository.findAll();
    }

    public Optional<BeverageContent> findById(UUID id) {
        return beverageContentRepository.findById(id);
    }

    public void deleteById(UUID id) {
        beverageContentRepository.deleteById(id);
    }
}
