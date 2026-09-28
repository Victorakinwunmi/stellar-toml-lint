class StellarTomlLint < Formula
  desc "Offline SEP-1 linter for stellar.toml"
  homepage "https://github.com/anchor-tools/stellar-toml-lint"
  version "0.1.0"
  sha256 :no_check
  license "Apache-2.0"
  head "https://github.com/anchor-tools/stellar-toml-lint.git", branch: "main"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{version}/stellar-toml-lint-macos-arm64"
    else
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{version}/stellar-toml-lint-macos-x64"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{version}/stellar-toml-lint-linux-arm64"
    else
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{version}/stellar-toml-lint-linux-x64"
    end
  end

  def install
    bin.install Dir["stellar-toml-lint-*"][0] => "stellar-toml-lint"
  end

  test do
    system "#{bin}/stellar-toml-lint", "--version"
  end
end
