#pragma once

#include <string>

class MotorService {
public:
    std::string get_motor_json() const;
    std::string set_rpm_cmd(int rpm);
};