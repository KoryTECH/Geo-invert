#!/usr/bin/env bash
set -e

echo "==> Installing C++ build essentials (cmake, build-essential, git)..."
sudo apt-get update -y
sudo apt-get install -y build-essential cmake git curl pkg-config libssl-dev

echo "==> Installing vcpkg (C++ package manager)..."
if [ ! -d "$HOME/vcpkg" ]; then
  git clone https://github.com/microsoft/vcpkg.git "$HOME/vcpkg"
    "$HOME/vcpkg/bootstrap-vcpkg.sh"
    fi
    echo 'export PATH="$HOME/vcpkg:$PATH"' >> ~/.bashrc

    echo "==> Installing opencode..."
    curl -fsSL https://opencode.ai/install | bash
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

    echo "==> Installing Python dependencies for the inversion microservice..."
    pip install --upgrade pip
    pip install fastapi uvicorn numpy pygimli

    echo "==> Setup complete."
    echo "Run 'opencode' in the terminal to start the AI coding agent."
    echo "Run 'docker compose up' from the infra/ folder to start Postgres/Redis/MinIO."
    