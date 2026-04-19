#pragma once
#include <string>
#include "../managers/device_manager.hpp"

class BatteryService {
public:
    explicit BatteryService(DeviceManager& device_manager);
    std::string get_battery_json();
private:
    DeviceManager& device_manager_;
};
