package com.example.stardropcafe.repository;

import com.example.stardropcafe.entity.Beverage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BeverageRepository extends JpaRepository<Beverage, UUID> {
}
