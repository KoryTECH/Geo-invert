#!/usr/bin/env bash
# Geo-Invert devcontainer bootstrap — Ubuntu/Debian (glibc) based image.
# Runs as postCreateCommand and is safe to re-run: every step is guarded.
# Why not Alpine: pyGIMLi's compiled core (`pgcore`) only ships manylinux
# (glibc) wheels; on musl `pip install pygimli` silently installs a broken
# core-less build. Python 3.11 is the version the working pgcore wheel
# targets (cp311).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VCPKG_DIR="$ROOT/vcpkg"           # backend/CMakeLists.txt expects EXACTLY this path
VENV="$ROOT/inversion-service/.venv"

echo "==> Base OS: $(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)"
if [ "$ROOT" != "/workspaces/Geo-invert" ]; then
  echo "    NOTE: repo is at $ROOT — CMakeLists.txt points at /workspaces/Geo-invert/vcpkg."
fi

dpkg_has() { dpkg -s "$1" >/dev/null 2>&1; }

echo "==> apt-get: build tools, vcpkg bootstrap deps, python venv tooling..."
sudo apt-get update -qq
for p in build-essential cmake ninja-build git curl zip unzip tar pkg-config \
         python3-venv python3-pip python-is-python3 ca-certificates; do
  if dpkg_has "$p"; then
    echo "    ok: $p"
  else
    echo "    install: $p"
    sudo apt-get install -y "$p"
  fi
done

# Node.js via apt (NodeSource LTS repo) — only if the devcontainer node feature
# did not already provide it.
if ! command -v node >/dev/null 2>&1; then
  echo "==> apt-get: Node.js LTS (NodeSource)..."
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash -
  sudo apt-get install -y nodejs
else
  echo "==> node $(node --version) already present"
fi

# --------------------------------------------------------------------------
# vcpkg — REQUIRED at /workspaces/Geo-invert/vcpkg (backend/CMakeLists.txt)
# --------------------------------------------------------------------------
if [ ! -d "$VCPKG_DIR/.git" ]; then
  echo "==> git clone: vcpkg -> $VCPKG_DIR"
  git clone https://github.com/microsoft/vcpkg.git "$VCPKG_DIR"
else
  echo "==> vcpkg already cloned"
fi

# Re-bootstrap when the binary is missing OR was built on a different libc
# (e.g. a vcpkg binary compiled on a previous musl image cannot run on glibc).
if [ ! -x "$VCPKG_DIR/vcpkg" ] || ! "$VCPKG_DIR/vcpkg" version >/dev/null 2>&1; then
  echo "==> bootstrap-vcpkg (fresh or incompatible binary)..."
  "$VCPKG_DIR/bootstrap-vcpkg.sh" -disableMetrics
fi

for port in crow cpp-httplib; do
  if "$VCPKG_DIR/vcpkg" list "$port" >/dev/null 2>&1; then
    echo "==> vcpkg port already installed: $port"
  else
    echo "==> vcpkg install: $port"
    "$VCPKG_DIR/vcpkg" install "$port"
  fi
done

# PATH markers — idempotent (no duplicate lines on re-run).
MARKER="# Geo-Invert devcontainer PATH (managed by .devcontainer/setup.sh)"
if ! grep -qsF "$MARKER" ~/.bashrc; then
  {
    echo "$MARKER"
    echo 'export PATH="/workspaces/Geo-invert/vcpkg:$PATH"'
    echo 'export PATH="$HOME/.opencode/bin:$PATH"'
  } >> ~/.bashrc
fi

# --------------------------------------------------------------------------
# Python 3.11 venv for the inversion service (pgcore cp311 wheel proven here)
# --------------------------------------------------------------------------
if python3 -c 'import sys; sys.exit(0 if sys.version_info[:2] == (3, 11) else 1)' 2>/dev/null; then
  PY=python3
elif command -v python3.11 >/dev/null 2>&1; then
  PY=python3.11
else
  echo "==> python 3.11 not found (devcontainer python feature should provide it)"
  sudo apt-get install -y python3.11 python3.11-venv
  PY=python3.11
fi
echo "==> using $PY -> $($PY --version 2>&1)"

# Recreate the venv if missing OR if it was built for the wrong ABI
# (a .venv created inside a musl image cannot run on glibc).
if [ ! -x "$VENV/bin/python" ] || ! "$VENV/bin/python" -c 'import sys; sys.exit(0 if sys.version_info[:2] == (3, 11) else 1)' 2>/dev/null; then
  echo "==> creating venv: $VENV"
  rm -rf "$VENV"
  "$PY" -m venv "$VENV"
else
  echo "==> venv ok: $VENV"
fi
"$VENV/bin/pip" install --quiet --upgrade pip
"$VENV/bin/pip" install --quiet -r "$ROOT/inversion-service/requirements.txt"

# --------------------------------------------------------------------------
# Frontend dependencies
# Reinstall from scratch if node_modules contains a musl esbuild binary
# (@esbuild/linux-musl-x64) — those native binaries do not run on glibc.
# --------------------------------------------------------------------------
if [ ! -f "$ROOT/frontend/package.json" ]; then
  echo "==> frontend/ not present yet — skipping npm install"
else
  if [ -d "$ROOT/frontend/node_modules/@esbuild/linux-musl-x64" ]; then
    echo "==> removing musl-built node_modules (esbuild binary ABI mismatch)..."
    rm -rf "$ROOT/frontend/node_modules"
  fi
  echo "==> npm install (frontend/)..."
  (cd "$ROOT/frontend" && npm install)
fi

# --------------------------------------------------------------------------
# opencode — a Codespace rebuild wipes /home/vscode/.opencode, and
# postCreateCommand runs exactly after that wipe, so this restores it.
# Exact install command (defined once at the top, referenced below):
#   curl -fsSL https://opencode.ai/install | bash
# --------------------------------------------------------------------------
if command -v opencode >/dev/null 2>&1; then
  echo "==> opencode already installed: $(opencode --version 2>/dev/null || echo present)"
else
  echo "==> installing opencode..."
  curl -fsSL https://opencode.ai/install | bash
fi

echo "==> Done."
echo "    - Backend C++ deps : vcpkg ($VCPKG_DIR) with crow + cpp-httplib"
echo "    - Inversion venv   : $VENV (python 3.11)"
echo "    - Frontend deps    : frontend/node_modules"
echo "    - opencode         : $(command -v opencode 2>/dev/null || echo 'run after opening a new shell')"
echo "    Services are NOT started automatically (postgres/redis/minio etc.):"
echo "    run: cd infra && docker compose up -d"
