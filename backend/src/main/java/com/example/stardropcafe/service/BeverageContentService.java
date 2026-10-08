package com.example.stardropcafe.service;

import com.example.stardropcafe.dto.BeverageResponseDTO.BeverageContentResponseDTO;
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

    public List<BeverageContentResponseDTO> findAllBeverageContentResponses() {
        return beverageContentRepository.findAllByOrderByNameAsc()
                .stream()
                .map(BeverageContentResponseDTO::from)
                .toList();
    }

    /**
     * Reuses an existing content whose name matches ignoring case, so typing
     * "milk" when "Milk" exists does not create a duplicate.
     */
    public BeverageContent findOrCreateByName(String name) {
        return beverageContentRepository.findFirstByNameIgnoreCase(name)
                .orElseGet(() -> {
                    BeverageContent beverageContent = new BeverageContent();
                    beverageContent.setName(name);
                    return beverageContentRepository.save(beverageContent);
                });
    }

    public List<BeverageContent> findAllById(Iterable<UUID> ids) {
        return beverageContentRepository.findAllById(ids);
    }

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
