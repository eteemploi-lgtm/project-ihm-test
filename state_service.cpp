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
}

void StateManager::update_temperature_sensors_from_can(const DecodedTemperatureSensorsFrame& decoded) {
    g_state.sensors.temperatures.temp_smo1 = decoded.temp_smo1;
    g_state.sensors.temperatures.temp_smo2 = decoded.temp_smo2;
    g_state.sensors.temperatures.temp_smo3 = decoded.temp_smo3;
    g_state.sensors.temperatures.temp_plaque = decoded.temp_plaque;

    // Pour garder un résumé moteur cohérent
    g_state.motor.temperature = decoded.temp_smo1;
}

void StateManager::update_pressure_from_can(const DecodedPressureFrame& decoded) {
    g_state.sensors.pressure.value = decoded.pressure;
    g_state.sensors.pressure.state = 1;
    g_state.sensors.pressure.label = "Actif";
}

void StateManager::update_water_from_can(const DecodedWaterFrame& decoded) {
    g_state.sensors.water.state = decoded.state;
    g_state.sensors.water.value = decoded.state;

    if (decoded.state == 1) {
        g_state.sensors.water.label = "Présence eau détectée";
    } else {
        g_state.sensors.water.label = "Aucune détection";
    }
}