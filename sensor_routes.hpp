#pragma once
#include <string>
#include "../services/sensor_service.hpp"

class SensorRoutes {
public:
    explicit SensorRoutes(SensorService& service);
    std::string handle_get_sensors();
private:
    SensorService& service_;
};
