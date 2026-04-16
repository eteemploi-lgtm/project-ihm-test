#pragma once
#include <string>

struct CanFrame {
    int id;
    std::string payload_hex;
};

class LibCommAdapter {
public:
    LibCommAdapter();
    bool send_can_frame(const CanFrame& frame);
    bool receive_can_frame(CanFrame& frame);
};
