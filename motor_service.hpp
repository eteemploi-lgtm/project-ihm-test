#pragma once
#include <string>
#include "../managers/device_manager.hpp"

class MotorService {
public:
    explicit MotorService(DeviceManager& device_manager);

    std::string get_motor_json() const;
    std::string set_rpm_cmd_json(int rpm_cmd);

private:
    DeviceManager& device_manager_;
};
