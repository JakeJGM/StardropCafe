package com.example.stardropcafe.repository;

import com.example.stardropcafe.entity.Beverage;
import com.example.stardropcafe.entity.BeverageContent;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

public final class BeverageSpecifications {

    private BeverageSpecifications() {
    }

    /**
     * Matches beverages whose type is any of {@code types}, whose temperature is
     * any of {@code temperatures}, and which contain every one of
     * {@code contentIds}. A null or empty argument leaves that field unfiltered.
     */
    public static Specification<Beverage> matching(
            Collection<String> types, Collection<String> temperatures, Collection<UUID> contentIds) {
        List<Specification<Beverage>> specs = new ArrayList<>();
        if (types != null && !types.isEmpty()) {
            specs.add(fieldInIgnoreCase("type", types));
        }
        if (temperatures != null && !temperatures.isEmpty()) {
            specs.add(fieldInIgnoreCase("temperature", temperatures));
        }
        if (contentIds != null) {
            contentIds.stream().distinct().forEach(id -> specs.add(containsContent(id)));
        }
        return Specification.allOf(specs);
    }

    // Case-insensitive so rows saved before temperatures were capitalized ("hot")
    // still match the values /beverages/options lists ("Hot").
    private static Specification<Beverage> fieldInIgnoreCase(String field, Collection<String> values) {
        List<String> lowered = values.stream().map(value -> value.toLowerCase(Locale.ROOT)).toList();
        return (root, query, cb) -> cb.lower(root.get(field)).in(lowered);
    }

    // An EXISTS per content, rather than joins on the root, so the beverage rows
    // aren't multiplied and the page count stays correct.
    private static Specification<Beverage> containsContent(UUID contentId) {
        return (root, query, cb) -> {
            Subquery<UUID> subquery = query.subquery(UUID.class);
            Root<Beverage> beverage = subquery.from(Beverage.class);
            Join<Beverage, BeverageContent> content = beverage.join("beverageContents");
            subquery.select(beverage.get("id"))
                    .where(cb.equal(beverage.get("id"), root.get("id")), cb.equal(content.get("id"), contentId));
            return cb.exists(subquery);
        };
    }
}
