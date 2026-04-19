#include "can/can_status.hpp"
#include "models/global_state.hpp"

#include <thread>
#include <chrono>

void start_can_watchdog() {
std::thread([]() {
while (true) {
bool rx_recent = false;

{
std::lock_guard<std::mutex> lock(g_can_status_mutex);

if (g_can_status.last_rx_time.time_since_epoch().count() > 0) {
const auto now = std::chrono::steady_clock::now();
const auto dt = std::chrono::duration_cast<std::chrono::milliseconds>(
now - g_can_status.last_rx_time
).count();
rx_recent = (dt < 1500);
}

g_can_status.bus_online = rx_recent;
g_can_status.rx_ok = rx_recent;
}

{
std::lock_guard<std::mutex> lock(g_state_mutex);
g_state.system.connection_status = rx_recent ? "connected" : "timeout";
g_state.system.server_status = "online";
g_state.system.can_status = rx_recent ? "live" : "unknown";
}

std::this_thread::sleep_for(std::chrono::milliseconds(1000));
}
}).detach();
}
    