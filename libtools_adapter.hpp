#pragma once
#include <string>
#include "libcomm_adapter.hpp"

class LibToolsAdapter {
public:
    CanFrame encode_motor_rpm_cmd(int rpm_cmd) const;
    int decode_motor_rpm_actual(const CanFrame& frame) const;
    double decode_motor_temperature(const CanFrame& frame) const;
};
