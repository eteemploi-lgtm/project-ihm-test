#pragma once
#include <string>
#include "motor_model.hpp"
#include "sensor_model.hpp"
#include "battery_model.hpp"
#include "governor_model.hpp"
#include "system_model.hpp"

struct GlobalState {
    SystemModel system;
    MotorModel motor;
    SensorModel sensors;
    BatteryModel battery;
    GovernorModel governor;

    GlobalState();
    std::string to_json() const;
};
