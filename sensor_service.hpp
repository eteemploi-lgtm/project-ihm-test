#pragma once
#include <string>
#include "../managers/device_manager.hpp"

class SensorService {
public:
    explicit SensorService(DeviceManager& device_manager);
    std::string get_sensors_json();
private:
    DeviceManager& device_manager_;
};
