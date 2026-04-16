#pragma once
#include <string>

struct MotorModel {
    std::string status;
    int rpm_actual;
    int rpm_cmd;
    double temperature;

    MotorModel();
    std::string to_json() const;
};
