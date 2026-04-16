#pragma once
#include <string>
#include "../managers/device_manager.hpp"

class GovernorService {
public:
    explicit GovernorService(DeviceManager& device_manager);
    std::string get_governor_json();
private:
    DeviceManager& device_manager_;
};
