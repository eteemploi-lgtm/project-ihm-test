#pragma once
#include <string>
#include "../managers/device_manager.hpp"

class StateService {
public:
    explicit StateService(DeviceManager& device_manager);

    std::string get_state_json();
    std::string get_status_json();

private:
    DeviceManager& device_manager_;
};
