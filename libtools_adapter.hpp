#pragma once

#include "models/can_frame.hpp"
#include "can/can_codec.hpp"

class LibToolsAdapter {
public:
    CanFrame build_motor_rpm_cmd(int rpm);
    CanFrame build_gouverne_position_cmd(double position);

    bool parse_motor_frame(const CanFrame& frame, DecodedMotorFrame& out);
    bool parse_temperature_frame(const CanFrame& frame, DecodedTemperatureSensorsFrame& out);
    bool parse_pressure_frame(const CanFrame& frame, DecodedPressureFrame& out);
    bool parse_water_frame(const CanFrame& frame, DecodedWaterFrame& out);
    bool parse_battery_frame(const CanFrame& frame, DecodedBatteryFrame& out);

private:
    CanCodec codec_;
};