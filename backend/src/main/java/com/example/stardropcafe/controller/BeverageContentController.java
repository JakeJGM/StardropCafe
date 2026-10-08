package com.example.stardropcafe.controller;

import com.example.stardropcafe.dto.BeverageResponseDTO.BeverageContentResponseDTO;
import com.example.stardropcafe.service.BeverageContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/beverage-contents")
@RequiredArgsConstructor
public class BeverageContentController {

    private final BeverageContentService beverageContentService;

    @GetMapping
    public List<BeverageContentResponseDTO> getBeverageContents() {
        return beverageContentService.findAllBeverageContentResponses();
    }
}
