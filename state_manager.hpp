#pragma once

#include "models/global_state.hpp"
#include "adapters/libtools_adapter.hpp"

class StateManager {
public:
    GlobalState& get_state();

    void update_motor_from_can(const DecodedMotorFrame& decoded);
    void update_temperature_sensors_from_can(const DecodedTemperatureSensorsFrame& decoded);
    void update_pressure_from_can(const DecodedPressureFrame& decoded);
    void update_water_from_can(const DecodedWaterFrame& decoded);
};