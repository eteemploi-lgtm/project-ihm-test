#include "../../include/adapters/libtools_adapter.hpp"
#include <sstream>

CanFrame LibToolsAdapter::encode_motor_rpm_cmd(int rpm_cmd) const {
    std::ostringstream oss;
    oss << rpm_cmd;
    CanFrame frame;
    frame.id = 0x201;
    frame.payload_hex = oss.str();
    return frame;
}

int LibToolsAdapter::decode_motor_rpm_actual(const CanFrame& frame) const {
    (void)frame;
    return 1450;
}

double LibToolsAdapter::decode_motor_temperature(const CanFrame& frame) const {
    (void)frame;
    return 39.0;
}
