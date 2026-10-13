# Build context is backend/ (all COPY paths below are relative to it), run from the repo root:
#   docker build -f docker/backend.Dockerfile backend
# backend/.dockerignore applies because it sits at the root of that context.

# ---------- Stage 1: build the jar and explode it into layers ----------
# Runs on the builder's native platform: the jar is platform-independent, so it's built once and
# reused for every target platform instead of compiling under emulation.
FROM --platform=$BUILDPLATFORM eclipse-temurin:25-jdk AS build
WORKDIR /workspace/app

# Copy the Gradle wrapper and build scripts first so they form their own cached layer.
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

# Build the executable Spring Boot jar (tests run in CI, not in the image build).
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew bootJar -x test --no-daemon

# Unpack the fat jar so dependencies and app classes can be copied as separate layers.
RUN mkdir -p build/dependency && \
    (cd build/dependency && jar -xf ../libs/*-SNAPSHOT.jar)

# ---------- Stage 2: minimal runtime image ----------
FROM eclipse-temurin:25-jre
RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

ARG DEPENDENCY=/workspace/app/build/dependency
# Ordered from least to most frequently changed to maximize layer cache reuse.
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

EXPOSE 8080
ENTRYPOINT ["java", "-cp", "app:app/lib/*", "com.example.stardropcafe.StardropCafeApplication"]
