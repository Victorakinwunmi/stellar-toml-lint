class StellarTomlLint < Formula
  VERSION = "0.1.0"

  desc "Offline SEP-1 linter for stellar.toml"
  homepage "https://github.com/anchor-tools/stellar-toml-lint"
  version VERSION
  sha256 :no_check
  license "Apache-2.0"
  head "https://github.com/anchor-tools/stellar-toml-lint.git", branch: "main"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{VERSION}/stellar-toml-lint-macos-arm64.tar.gz"
    else
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{VERSION}/stellar-toml-lint-macos-x64.tar.gz"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{VERSION}/stellar-toml-lint-linux-arm64.tar.gz"
    else
      url "https://github.com/anchor-tools/stellar-toml-lint/releases/download/v#{VERSION}/stellar-toml-lint-linux-x64.tar.gz"
    end
  end

  def install
    bin.install Dir["stellar-toml-lint-*"].first => "stellar-toml-lint"
  end

  test do
    system "#{bin}/stellar-toml-lint", "--version"
  end
end
