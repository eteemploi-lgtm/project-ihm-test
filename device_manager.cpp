#include "managers/device_manager.hpp"
#include "adapters/libcomm_adapter.hpp"
#include "adapters/libtools_adapter.hpp"
#include "models/can_frame.hpp"

static LibCommAdapter g_libcomm;
static LibToolsAdapter g_libtools;

bool DeviceManager::set_motor_rpm(int rpm) {
    CanFrame frame = g_libtools.encode_motor_rpm_cmd(rpm);
    return g_libcomm.send_frame(frame);
}