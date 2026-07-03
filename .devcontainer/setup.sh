#!/usr/bin/env bash
set -e

echo "==> Installing C++ build essentials..."
sudo apt-get update -y
sudo apt-get install -y build-essential cmake git curl pkg-config libssl-dev

echo "==> Installing vcpkg..."
if [ ! -d "$HOME/vcpkg" ]; then
  git clone https://github.com/microsoft/vcpkg.git "$HOME/vcpkg"
  "$HOME/vcpkg/bootstrap-vcpkg.sh"
fi
echo 'export PATH="$HOME/vcpkg:$PATH"' >> ~/.bashrc

echo "==> Installing pyGIMLi and Python dependencies..."
pip install --upgrade pip
pip install pygimli fastapi uvicorn numpy

echo "==> Installing opencode..."
curl -fsSL https://opencode.ai/install | bash

echo "==> Done. Run 'source ~/.bashrc' then 'opencode' to start."
