#pragma once

#include "models/can_frame.hpp"

class LibCommAdapter {
public:
    bool init();
    bool send_frame(const CanFrame& frame);
    bool receive_frame(CanFrame& frame);

private:
    bool initialized_ = false;
};