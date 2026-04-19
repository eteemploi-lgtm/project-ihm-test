#pragma once
#include <string>

struct GovernorModel {
    std::string status;
    double position;
    double velocity;
    double torque;

    GovernorModel();
    std::string to_json() const;
};
