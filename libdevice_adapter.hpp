#pragma once
#include "../models/motor_model.hpp"
#include "../models/sensor_model.hpp"
#include "../models/battery_model.hpp"
#include "../models/governor_model.hpp"

class LibDeviceAdapter {
public:
    LibDeviceAdapter();

    MotorModel read_motor() const;
    SensorModel read_sensors() const;
    BatteryModel read_battery() const;
    GovernorModel read_governor() const;
};
