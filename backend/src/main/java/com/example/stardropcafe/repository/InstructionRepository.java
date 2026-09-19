package com.example.stardropcafe.repository;

import com.example.stardropcafe.entity.Instruction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InstructionRepository extends JpaRepository<Instruction, UUID> {
}
