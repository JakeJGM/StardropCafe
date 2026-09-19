package com.example.stardropcafe.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Beverage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String type;

    private String temperature;

    @ManyToMany
    @JoinTable(
            name = "beverage_beverage_content",
            joinColumns = @JoinColumn(name = "beverage_id"),
            inverseJoinColumns = @JoinColumn(name = "beverage_content_id")
    )
    private Set<BeverageContent> beverageContents = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;
}
