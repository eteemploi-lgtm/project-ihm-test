#include "../../include/managers/can_manager.hpp"

CanManager::CanManager() : comm_(), tools_() {}

bool CanManager::send_motor_rpm_cmd(int rpm_cmd) {
    CanFrame frame = tools_.encode_motor_rpm_cmd(rpm_cmd);
    return comm_.send_can_frame(frame);
}

bool CanManager::poll() {
    CanFrame frame;
    return comm_.receive_can_frame(frame);
}
