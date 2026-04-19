#include "adapters/libcomm_adapter.hpp"

bool LibCommAdapter::init() {
    initialized_ = true;
    return true;
}

bool LibCommAdapter::send_frame(const CanFrame& frame) {
    if (!initialized_) return false;
    (void)frame;
    return true;
}

bool LibCommAdapter::receive_frame(CanFrame& frame) {
    if (!initialized_) return false;
    (void)frame;
    return false;
}