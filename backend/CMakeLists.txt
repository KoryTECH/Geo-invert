cmake_minimum_required(VERSION 3.20)
project(geo-invert-backend)

set(CMAKE_CXX_STANDARD 20)

set(CMAKE_TOOLCHAIN_FILE "/workspaces/Geo-invert/vcpkg/scripts/buildsystems/vcpkg.cmake"
    CACHE STRING "Vcpkg toolchain file")

find_package(Crow CONFIG REQUIRED)

add_executable(backend src/main.cpp)
target_link_libraries(backend PRIVATE Crow::Crow)
