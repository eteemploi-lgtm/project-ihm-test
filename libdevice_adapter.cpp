#include "adapters/libdevice_adapter.hpp"

// FUTUR : inclure LibDevice réel
// #include "external/LibDevice/LibDevice.h"

bool LibDeviceAdapter::init() {
    // FUTUR :
    // initialized_ = LibDevice_Init();
    initialized_ = true;
    return initialized_;
}

bool LibDeviceAdapter::sync_motor(GlobalState& state) {
    if (!initialized_) return false;

    // FUTUR :
    // state.motor.rpm_actual = LibDevice_GetMotorRpm();
    // state.motor.temperature = LibDevice_GetMotorTemperature();

    (void)state;
    return true;
}

bool LibDeviceAdapter::sync_gouverne(GlobalState& state) {
    if (!initialized_) return false;

    (void)state;
    return true;
}

bool LibDeviceAdapter::sync_sensors(GlobalState& state) {
    if (!initialized_) return false;

    (void)state;
    return true;
}

bool LibDeviceAdapter::sync_battery(GlobalState& state) {
    if (!initialized_) return false;

    (void)state;
    return true;
}