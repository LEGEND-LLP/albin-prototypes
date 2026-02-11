//! SCIP Indexer Orchestration
//!
//! Manages the execution of SCIP indexers for different languages.

use crate::detect::{Language, LanguageInfo};
use anyhow::{anyhow, Context, Result};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;
use tracing::{debug, info, warn};

/// Result of running an indexer
#[derive(Debug)]
pub struct IndexerResult {
    pub language: Language,
    pub scip_path: PathBuf,
    pub success: bool,
    pub error: Option<String>,
}

/// Orchestrates SCIP indexer execution
pub struct IndexerOrchestrator {
    indexers_path: Option<PathBuf>,
    codebase_path: PathBuf,
    output_dir: PathBuf,
}

impl IndexerOrchestrator {
    /// Create a new orchestrator
    pub fn new(codebase_path: PathBuf, indexers_path: Option<PathBuf>) -> Result<Self> {
        let output_dir = codebase_path.join(".legend-indexer");

        // Remove stale .scip files and detection report from previous runs
        if output_dir.exists() {
            for entry in std::fs::read_dir(&output_dir)
                .context("Failed to read output directory")?
                .flatten()
            {
                let path = entry.path();
                let is_stale = path.extension().is_some_and(|ext| ext == "scip")
                    || path.file_name().is_some_and(|n| n == "detection-report.json");
                if is_stale {
                    debug!("Removing stale file: {:?}", path);
                    std::fs::remove_file(&path)
                        .with_context(|| format!("Failed to remove stale file: {:?}", path))?;
                }
            }
        }

        std::fs::create_dir_all(&output_dir)
            .context("Failed to create output directory")?;

        Ok(Self {
            indexers_path,
            codebase_path,
            output_dir,
        })
    }

    /// Check if an indexer is available (either bundled or in PATH)
    pub fn is_indexer_available(&self, language: Language) -> bool {
        self.get_bundled_path(language.scip_indexer()).is_some()
            || self.find_indexer_in_path(language).is_some()
    }

    /// Find an indexer binary in PATH
    fn find_indexer_in_path(&self, language: Language) -> Option<PathBuf> {
        for name in language.scip_binary_names() {
            if let Ok(path) = which::which(name) {
                return Some(path);
            }
        }

        // For languages that use npm/node packages, check npx availability
        if matches!(language, Language::TypeScript | Language::JavaScript)
            && which::which("npx").is_ok()
        {
            return Some(PathBuf::from("npx"));
        }

        None
    }

    /// Run the appropriate indexer for a language
    pub fn run_indexer(&self, language: Language) -> Result<IndexerResult> {
        info!("Running indexer for {:?}", language);

        let scip_output = self.scip_output_path(language);
        let output_str = scip_output.to_str().unwrap();

        let result = match language {
            Language::TypeScript | Language::JavaScript => {
                self.run_typescript_indexer(&scip_output)
            }
            Language::Python => self.run_simple_indexer("scip-python", &["index", ".", "--output", output_str]),
            Language::CSharp => self.run_dotnet_indexer(&scip_output),
            Language::Java | Language::Kotlin | Language::Scala => {
                self.run_simple_indexer("scip-java", &["index", "--output", output_str])
            }
            Language::Go => self.run_simple_indexer("scip-go", &["--output", output_str]),
            Language::Rust => self.run_simple_indexer("rust-analyzer", &["scip", ".", "--output", output_str]),
            Language::Ruby => self.run_simple_indexer("scip-ruby", &["--output", output_str]),
            Language::Cpp | Language::C => self.run_simple_indexer("scip-clang", &["--output", output_str]),
            _ => Err(anyhow!("Indexer for {:?} not yet implemented", language)),
        };

        match result {
            Ok(()) => Ok(IndexerResult {
                language,
                scip_path: scip_output,
                success: true,
                error: None,
            }),
            Err(e) => {
                warn!("Indexer failed for {:?}: {}", language, e);
                Ok(IndexerResult {
                    language,
                    scip_path: scip_output,
                    success: false,
                    error: Some(e.to_string()),
                })
            }
        }
    }

    /// Run indexers for all detected languages
    pub fn run_all(&self, languages: &[LanguageInfo]) -> Vec<IndexerResult> {
        let mut results = Vec::new();

        for lang_info in languages {
            if !self.is_indexer_available(lang_info.language) {
                warn!(
                    "Indexer for {:?} not available. Install with: {}",
                    lang_info.language,
                    lang_info.language.install_command()
                );
                results.push(IndexerResult {
                    language: lang_info.language,
                    scip_path: PathBuf::new(),
                    success: false,
                    error: Some("Indexer not installed".to_string()),
                });
                continue;
            }

            match self.run_indexer(lang_info.language) {
                Ok(result) => results.push(result),
                Err(e) => {
                    results.push(IndexerResult {
                        language: lang_info.language,
                        scip_path: PathBuf::new(),
                        success: false,
                        error: Some(e.to_string()),
                    });
                }
            }
        }

        results
    }

    /// Run scip-typescript indexer (special: monorepo detection + npx fallback)
    fn run_typescript_indexer(&self, output: &Path) -> Result<()> {
        let has_root_tsconfig = self.codebase_path.join("tsconfig.json").exists();

        let output_str = output.to_str().unwrap();
        let mut args = vec!["index", "--output", output_str];
        if !has_root_tsconfig {
            debug!("No root tsconfig.json found, using --infer-tsconfig for monorepo support");
            args.push("--infer-tsconfig");
        }

        // Try bundled first
        if let Some(bundled) = self.get_bundled_path("scip-typescript") {
            return self.execute_indexer(bundled.to_str().unwrap(), &args);
        }

        // Try npx
        if which::which("npx").is_ok() {
            debug!("Using npx to run scip-typescript");
            let mut npx_args = vec!["@sourcegraph/scip-typescript"];
            npx_args.extend(args.iter());

            let status = Command::new("npx")
                .current_dir(&self.codebase_path)
                .args(&npx_args)
                .status()
                .context("Failed to run npx scip-typescript")?;

            if status.success() {
                return Ok(());
            }
        }

        // Try direct command
        self.execute_indexer("scip-typescript", &args)
    }

    /// Run a simple indexer: try bundled path first, then fall back to PATH
    fn run_simple_indexer(&self, binary: &str, args: &[&str]) -> Result<()> {
        if let Some(bundled) = self.get_bundled_path(binary) {
            return self.execute_indexer(bundled.to_str().unwrap(), args);
        }
        self.execute_indexer(binary, args)
    }

    /// Run scip-dotnet indexer (special: solution file discovery + multiple fallbacks)
    fn run_dotnet_indexer(&self, output: &Path) -> Result<()> {
        let solution_file = self.find_dotnet_solution();

        let mut args = vec!["index"];
        let solution_str;
        if let Some(ref sln) = solution_file {
            solution_str = sln.to_string_lossy().to_string();
            args.push(&solution_str);
        }
        args.push("--output");
        let output_str = output.to_str().unwrap();
        args.push(output_str);

        if let Some(bundled) = self.get_bundled_path("scip-dotnet") {
            return self.execute_indexer(bundled.to_str().unwrap(), &args);
        }

        if which::which("scip-dotnet").is_ok() {
            return self.execute_indexer("scip-dotnet", &args);
        }

        // Try global dotnet tools location
        let home = std::env::var("HOME").unwrap_or_default();
        let global_tool = PathBuf::from(&home).join(".dotnet/tools/scip-dotnet");
        if global_tool.exists() {
            return self.execute_indexer(global_tool.to_str().unwrap(), &args);
        }

        // Fallback to dotnet tool run (requires local manifest)
        let mut cmd_args: Vec<&str> = vec!["tool", "run", "scip-dotnet", "--"];
        for arg in &args {
            cmd_args.push(arg);
        }

        let status = Command::new("dotnet")
            .current_dir(&self.codebase_path)
            .args(&cmd_args)
            .status()
            .context("Failed to run dotnet scip-dotnet")?;

        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("scip-dotnet exited with non-zero status"))
        }
    }

    /// Find a file with the given extension in a directory
    fn find_file_with_ext(&self, dir: &Path, ext: &str) -> Option<PathBuf> {
        std::fs::read_dir(dir).ok()?.flatten().find_map(|entry| {
            let path = entry.path();
            path.extension().is_some_and(|e| e == ext).then_some(path)
        })
    }

    /// Find a .sln or .csproj file in the codebase
    fn find_dotnet_solution(&self) -> Option<PathBuf> {
        // Check for .sln in root
        if let Some(sln) = self.find_file_with_ext(&self.codebase_path, "sln") {
            return Some(sln);
        }

        // Check common subdirectories for .sln
        for subdir in &["src", "source", "Source", "Src"] {
            let dir = self.codebase_path.join(subdir);
            if dir.exists() {
                if let Some(sln) = self.find_file_with_ext(&dir, "sln") {
                    return Some(sln);
                }
            }
        }

        // Check for .csproj in root
        self.find_file_with_ext(&self.codebase_path, "csproj")
    }

    /// Get path to bundled indexer if it exists
    fn get_bundled_path(&self, indexer: &str) -> Option<PathBuf> {
        self.indexers_path.as_ref().and_then(|base| {
            let path = base.join(indexer);
            path.exists().then_some(path)
        })
    }

    /// Execute an indexer binary
    fn execute_indexer(&self, binary: &str, args: &[&str]) -> Result<()> {
        debug!("Executing: {} {:?}", binary, args);

        let status = Command::new(binary)
            .current_dir(&self.codebase_path)
            .args(args)
            .status()
            .with_context(|| format!("Failed to run {}", binary))?;

        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("{} exited with status: {:?}", binary, status.code()))
        }
    }

    /// Get the output path for a given language's SCIP file
    pub fn scip_output_path(&self, language: Language) -> PathBuf {
        self.output_dir.join(format!("{}.scip", language.scip_output_stem()))
    }

    /// Get the output directory for SCIP files
    pub fn output_dir(&self) -> &Path {
        &self.output_dir
    }

    /// Clean up generated SCIP files
    pub fn cleanup(&self) -> Result<()> {
        if self.output_dir.exists() {
            std::fs::remove_dir_all(&self.output_dir)?;
        }
        Ok(())
    }
}

/// Check which indexers are available on the system
pub fn check_available_indexers() -> HashMap<Language, bool> {
    let temp_orchestrator = IndexerOrchestrator {
        indexers_path: None,
        codebase_path: PathBuf::from("."),
        output_dir: PathBuf::from("."),
    };

    Language::ALL
        .iter()
        .map(|&lang| (lang, temp_orchestrator.is_indexer_available(lang)))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_language_indexer_metadata() {
        assert_eq!(Language::TypeScript.scip_indexer(), "scip-typescript");
        assert!(Language::TypeScript.is_bundled());
        assert!(!Language::Ruby.is_bundled());
    }
}
