# Legend Indexer (SCIP Engine)

Rust CLI tool that detects programming languages in a codebase and runs the appropriate [SCIP](https://github.com/sourcegraph/scip) indexers to produce raw `.scip` protobuf files.

## Docker (recommended)

The included `Dockerfile` bundles SCIP indexers for TypeScript, JavaScript, Python, C#, Java, Kotlin, Scala, Go, and PHP:

```bash
docker build -t scip-engine .

docker run --rm \
  -v "/path/to/codebase:/workspace" \
  -v "$(pwd)/output:/output" \
  scip-engine /workspace --output /output
```

## Project Structure

```
src/
├── main.rs         # CLI entry point
├── lib.rs          # Library root
├── config.rs       # Configuration
├── detect.rs       # Language detection
└── orchestrate.rs  # SCIP indexer execution
```

## Testing

```bash
docker build -f Dockerfile.test -t scip-engine-test .
docker run --rm scip-engine-test
```

See the [root README](../README.md) for full documentation, CLI reference, and script usage.
