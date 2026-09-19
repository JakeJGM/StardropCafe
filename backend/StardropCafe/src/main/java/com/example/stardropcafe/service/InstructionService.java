package com.example.stardropcafe.service;

import com.example.stardropcafe.entity.Instruction;
import com.example.stardropcafe.repository.InstructionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstructionService {

    private final InstructionRepository instructionRepository;

    public Instruction save(Instruction instruction) {
        return instructionRepository.save(instruction);
    }

    public List<Instruction> findAll() {
        return instructionRepository.findAll();
    }

    public Optional<Instruction> findById(UUID id) {
        return instructionRepository.findById(id);
    }

    public void deleteById(UUID id) {
        instructionRepository.deleteById(id);
    }
}
