#include "managers/state_manager.hpp"

extern GlobalState g_state;

GlobalState& StateManager::get_state() {
    return g_state;
}

void StateManager::update_motor_from_can(const DecodedMotorFrame& decoded) {
    g_state.motor.rpm_actual = decoded.rpm_actual;
    g_state.motor.temperature = decoded.temperature;

    if (decoded.status_code == 0) {
        g_state.motor.status = "STOP";
    } else {
        g_state.motor.status = "RUN";
    }

    g_state.sensors.temperature = decoded.temperature;
}