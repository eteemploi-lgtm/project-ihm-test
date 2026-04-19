#include "managers/can_manager.hpp"
#include "adapters/libcomm_adapter.hpp"
#include "adapters/libtools_adapter.hpp"
#include "managers/state_manager.hpp"
#include "models/can_frame.hpp"

static LibCommAdapter g_libcomm;
static LibToolsAdapter g_libtools;
static StateManager g_state_manager;

bool CanManager::init() {
    return g_libcomm.init();
}

void CanManager::poll_once() {
    CanFrame frame;
    if (!g_libcomm.receive_frame(frame)) {
        return;
    }

    DecodedMotorFrame motorDecoded;
    if (g_libtools.decode_motor_frame(frame, motorDecoded)) {
        g_state_manager.update_motor_from_can(motorDecoded);
        return;
    }

    DecodedTemperatureSensorsFrame tempDecoded;
    if (g_libtools.decode_temperature_sensors_frame(frame, tempDecoded)) {
        g_state_manager.update_temperature_sensors_from_can(tempDecoded);
        return;
    }

    DecodedPressureFrame pressureDecoded;
    if (g_libtools.decode_pressure_frame(frame, pressureDecoded)) {
        g_state_manager.update_pressure_from_can(pressureDecoded);
        return;
    }

    DecodedWaterFrame waterDecoded;
    if (g_libtools.decode_water_frame(frame, waterDecoded)) {
        g_state_manager.update_water_from_can(waterDecoded);
        return;
    }
}