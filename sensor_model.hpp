#pragma once
#include <string>

struct BinarySensor {
    int state;
    std::string label;
    double value;
    std::string unit;

    BinarySensor();
    std::string to_json() const;
};

struct SensorModel {
    BinarySensor water;
    BinarySensor pressure;
    BinarySensor temperature;

    SensorModel();
    std::string to_json() const;
};
