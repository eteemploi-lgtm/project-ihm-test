#pragma once

#include <vector>
#include <cstdint>

struct CanFrame {
    int id;
    std::vector<uint8_t> data;
};