#pragma once

#include "models/can_frame.hpp"

struct DecodedMotorFrame {
    int rpm_actual;
    double temperature;
    int status_code;
};

struct DecodedTemperatureSensorsFrame {
    int temp_smo1;
    int temp_smo2;
    int temp_smo3;
    int temp_plaque;
};

struct DecodedPressureFrame {
    double pressure;
};

struct DecodedWaterFrame {
    int state;
};

struct DecodedBatteryFrame {
    int level;
    double temperature;
    double t1_disque;
    double t2_disque;
};

class CanCodec {
public:
    CanFrame encode_motor_rpm_cmd(int rpm);
    CanFrame encode_gouverne_position_cmd(double position);

    bool decode_motor_frame(const CanFrame& frame, DecodedMotorFrame& out);
    bool decode_temperature_frame(const CanFrame& frame, DecodedTemperatureSensorsFrame& out);
    bool decode_pressure_frame(const CanFrame& frame, DecodedPressureFrame& out);
    bool decode_water_frame(const CanFrame& frame, DecodedWaterFrame& out);
    bool decode_battery_frame(const CanFrame& frame, DecodedBatteryFrame& out);
};