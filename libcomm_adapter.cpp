#include "../../include/adapters/libcomm_adapter.hpp"

LibCommAdapter::LibCommAdapter() {}

bool LibCommAdapter::send_can_frame(const CanFrame& frame) {
    (void)frame;
    // TODO: brancher LibComm / LibTools_CommCan ici
    return true;
}

bool LibCommAdapter::receive_can_frame(CanFrame& frame) {
    (void)frame;
    // TODO: lecture réelle CAN
    return false;
}
