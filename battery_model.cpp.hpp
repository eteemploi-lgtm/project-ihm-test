#pragma once
#include <string>

struct BatteryModel {
    std::string status;
    int soc;
    double temperature;
    double voltage;

    BatteryModel();
    std::string to_json() const;
};
