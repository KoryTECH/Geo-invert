cmake_minimum_required(VERSION 3.20)
project(geo-invert-backend)

set(CMAKE_CXX_STANDARD 20)



find_package(Crow CONFIG REQUIRED)
find_package(httplib CONFIG REQUIRED)

add_executable(backend src/main.cpp src/inversion_client.cpp)
target_link_libraries(backend PRIVATE Crow::Crow httplib::httplib)
