#include "../../include/managers/device_manager.hpp"

DeviceManager::DeviceManager() : state_manager_(), can_manager_(), device_adapter_() {
    refresh_from_devices();
}

MotorModel DeviceManager::get_motor() const {
    return state_manager_.state().motor;
}

SensorModel DeviceManager::get_sensors() const {
    return state_manager_.state().sensors;
}

BatteryModel DeviceManager::get_battery() const {
    return state_manager_.state().battery;
}

GovernorModel DeviceManager::get_governor() const {
    return state_manager_.state().governor;
}

bool DeviceManager::set_motor_rpm(int rpm_cmd) {
    if (rpm_cmd < 0 || rpm_cmd > 3000) {
        return false;
    }

    if (can_manager_.send_motor_rpm_cmd(rpm_cmd)) {
        state_manager_.state().motor.rpm_cmd = rpm_cmd;
        state_manager_.state().motor.status = (rpm_cmd == 0) ? "STOP" : "RUN";
        return true;
    }
    return false;
}

void DeviceManager::refresh_from_devices() {
    state_manager_.state().motor = device_adapter_.read_motor();
    state_manager_.state().sensors = device_adapter_.read_sensors();
    state_manager_.state().battery = device_adapter_.read_battery();
    state_manager_.state().governor = device_adapter_.read_governor();
}

GlobalState DeviceManager::get_global_state() const {
    return state_manager_.state();
}
