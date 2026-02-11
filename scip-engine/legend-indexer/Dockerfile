# SCIP Engine Docker Image
# Pre-bundled with all SCIP indexers for language-agnostic codebase analysis
#
# Usage:
#   docker run --rm \
#     -v "/path/to/codebase:/workspace" \
#     -v "$(pwd)/output:/output" \
#     scip-engine /workspace --output /output

FROM ubuntu:22.04 AS base

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install base dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# ============================================ 
# Stage: Node.js + TypeScript/Python indexers
# ============================================ 
FROM base AS node-stage

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install scip-typescript and scip-python globally
RUN npm install -g @sourcegraph/scip-typescript @sourcegraph/scip-python

# ============================================ 
# Stage: .NET + C# indexer
# ============================================ 
FROM base AS dotnet-stage

# Install .NET 8 SDK (auto-detects architecture)
RUN curl -fsSL https://dot.net/v1/dotnet-install.sh -o dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 8.0 --install-dir /usr/share/dotnet \
    && rm dotnet-install.sh

ENV PATH="/usr/share/dotnet:${PATH}"
ENV DOTNET_ROOT="/usr/share/dotnet"

# Install scip-dotnet
RUN /usr/share/dotnet/dotnet tool install -g scip-dotnet

# ============================================ 
# Stage: Go + Go indexer (multi-arch)
# ============================================ 
FROM base AS go-stage

ARG TARGETARCH

# Install Go 1.21 (architecture-aware)
RUN case "${TARGETARCH}" in \
        "amd64") GO_ARCH="amd64" ;; \
        "arm64") GO_ARCH="arm64" ;; \
        *) echo "Unsupported architecture: ${TARGETARCH}" && exit 1 ;; \
    esac \
    && curl -fsSL "https://go.dev/dl/go1.21.0.linux-${GO_ARCH}.tar.gz" | tar -C /usr/local -xzf - 

ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"
ENV GOPATH="/root/go"

# Install scip-go (main command is in cmd/scip-go subdirectory)
RUN go install github.com/sourcegraph/scip-go/cmd/scip-go@latest

# ============================================
# Stage: Java + scip-java indexer (Java, Kotlin, Scala)
# ============================================
FROM base AS java-stage

ARG TARGETARCH

# Install OpenJDK 17
RUN apt-get update && apt-get install -y openjdk-17-jdk-headless && rm -rf /var/lib/apt/lists/*

# Install Coursier (architecture-aware)
RUN case "${TARGETARCH}" in \
        "amd64") CS_ARCH="x86_64" ;; \
        "arm64") CS_ARCH="aarch64" ;; \
        *) echo "Unsupported architecture: ${TARGETARCH}" && exit 1 ;; \
    esac \
    && curl -fL "https://github.com/coursier/launchers/raw/master/cs-${CS_ARCH}-pc-linux.gz" \
       | gzip -d > /usr/local/bin/cs \
    && chmod +x /usr/local/bin/cs

# Install scip-java (--contrib channel required)
RUN cs install --contrib scip-java

# Note: Ruby/scip-ruby is not bundled — scip-ruby only publishes x86_64-linux
# binaries (no arm64), making it unsuitable for multi-arch images. TODO: revisit
# when upstream adds arm64 support. See https://github.com/sourcegraph/scip-ruby

# ============================================
# Stage: PHP + scip-php indexer
# ============================================
FROM base AS php-stage

# Add PPA for PHP 8.2 (scip-php requires ^8.2, Ubuntu 22.04 ships 8.1)
RUN apt-get update && apt-get install -y software-properties-common \
    && add-apt-repository -y ppa:ondrej/php \
    && apt-get update && apt-get install -y php8.2-cli && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install scip-php
RUN composer global require davidrjenni/scip-php

# ============================================
# Stage: Rust build of legend-indexer
# ============================================
FROM base AS rust-build

# Install Rust (auto-detects architecture)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

# Copy Cargo files first for dependency caching
WORKDIR /build
COPY Cargo.toml Cargo.lock ./

# Create dummy src to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "pub fn dummy() {}" > src/lib.rs

# Build dependencies only
RUN cargo build --release && rm -rf src

# Now copy actual source
COPY src ./src

# Build the actual binary
RUN touch src/main.rs src/lib.rs && cargo build --release

# ============================================ 
# Final stage: Combine everything
# ============================================ 
FROM ubuntu:22.04

ARG TARGETARCH

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    # Python runtime (required for scip-python)
    python3.11 \
    python3-pip \
    # Required for .NET on Linux
    libicu70 \
    # Java runtime
    openjdk-17-jre-headless \
    # Required for adding PPAs
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install PHP 8.2 (scip-php requires ^8.2, Ubuntu 22.04 ships 8.1)
RUN add-apt-repository -y ppa:ondrej/php \
    && apt-get update && apt-get install -y php8.2-cli \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy .NET SDK
COPY --from=dotnet-stage /usr/share/dotnet /usr/share/dotnet
COPY --from=dotnet-stage /root/.dotnet/tools /root/.dotnet/tools
ENV PATH="/usr/share/dotnet:/root/.dotnet/tools:${PATH}"
ENV DOTNET_ROOT="/usr/share/dotnet"

# Copy Go
COPY --from=go-stage /usr/local/go /usr/local/go
COPY --from=go-stage /root/go/bin /root/go/bin
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"
ENV GOPATH="/root/go"

# Copy Node.js tools (scip-typescript, scip-python)
COPY --from=node-stage /usr/lib/node_modules /usr/lib/node_modules

# Create wrapper script for scip-typescript
RUN printf '#!/bin/bash\nexec node /usr/lib/node_modules/@sourcegraph/scip-typescript/dist/src/main.js "$@"\n' > /usr/local/bin/scip-typescript \
    && chmod +x /usr/local/bin/scip-typescript

# Create wrapper script for scip-python
# Note: entry point is index.js in root of package
RUN printf '#!/bin/bash\nexec node /usr/lib/node_modules/@sourcegraph/scip-python/index.js "$@"\n' > /usr/local/bin/scip-python \
    && chmod +x /usr/local/bin/scip-python

# Copy Java tools (scip-java via Coursier)
COPY --from=java-stage /root/.local/share/coursier/bin/scip-java /usr/local/bin/scip-java

# Copy PHP Composer + scip-php
COPY --from=php-stage /usr/local/bin/composer /usr/local/bin/composer
COPY --from=php-stage /root/.config/composer /root/.config/composer
ENV PATH="/root/.config/composer/vendor/bin:${PATH}"

# Copy legend-indexer binary
COPY --from=rust-build /build/target/release/legend-indexer /usr/local/bin/legend-indexer

# Create workspace directory
WORKDIR /workspace

# Verify installations (helpful for debugging)
RUN echo "=== Verifying installations ===" \
    && echo "Architecture: ${TARGETARCH}" \
    && echo "Node.js: $(node --version)" \
    && echo "npm: $(npm --version)" \
    && echo ".NET: $(dotnet --version)" \
    && echo "Go: $(go version)" \
    && echo "Python: $(python3 --version)" \
    && echo "Java: $(java --version 2>&1 | head -1)" \
    && echo "scip-java: $(scip-java --version 2>&1 | head -1 || echo 'installed')" \
    && echo "PHP: $(php8.2 --version | head -1)" \
    && echo "scip-php: $(scip-php --version 2>&1 | head -1 || echo 'installed')" \
    && echo "legend-indexer: $(legend-indexer --version)" \
    && echo "=== All tools installed ==="

# Default entrypoint runs legend-indexer
ENTRYPOINT ["legend-indexer"]

# Default command shows help
CMD ["--help"]