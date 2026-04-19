#include "adapters/libtools_adapter.hpp"

// FUTUR : ici tu pourras inclure LibTools réel
// #include "external/LibTools/LibTools.h"

CanFrame LibToolsAdapter::build_motor_rpm_cmd(int rpm) {
    return codec_.encode_motor_rpm_cmd(rpm);
}

CanFrame LibToolsAdapter::build_gouverne_position_cmd(double position) {
    return codec_.encode_gouverne_position_cmd(position);
}

bool LibToolsAdapter::parse_motor_frame(const CanFrame& frame, DecodedMotorFrame& out) {
    return codec_.decode_motor_frame(frame, out);
}

bool LibToolsAdapter::parse_temperature_frame(const CanFrame& frame, DecodedTemperatureSensorsFrame& out) {
    return codec_.decode_temperature_frame(frame, out);
}

bool LibToolsAdapter::parse_pressure_frame(const CanFrame& frame, DecodedPressureFrame& out) {
    return codec_.decode_pressure_frame(frame, out);
}

bool LibToolsAdapter::parse_water_frame(const CanFrame& frame, DecodedWaterFrame& out) {
    return codec_.decode_water_frame(frame, out);
}

bool LibToolsAdapter::parse_battery_frame(const CanFrame& frame, DecodedBatteryFrame& out) {
    return codec_.decode_battery_frame(frame, out);
}