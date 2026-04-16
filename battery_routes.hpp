#pragma once
#include <string>
#include "../services/battery_service.hpp"

class BatteryRoutes {
public:
    explicit BatteryRoutes(BatteryService& service);
    std::string handle_get_battery();
private:
    BatteryService& service_;
};
