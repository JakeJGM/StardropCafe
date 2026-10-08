package com.example.stardropcafe.repository;

import com.example.stardropcafe.entity.BeverageContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BeverageContentRepository extends JpaRepository<BeverageContent, UUID> {

    List<BeverageContent> findAllByOrderByNameAsc();

    Optional<BeverageContent> findFirstByNameIgnoreCase(String name);
}
