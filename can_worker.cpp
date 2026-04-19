#include "can/can_status.hpp"
#include "models/global_state.hpp"
#include "config/runtime_mode.hpp"

#include <thread>
#include <chrono>

void start_can_worker() {
std::thread([]() {
{
std::lock_guard<std::mutex> lock(g_can_status_mutex);
g_can_status.worker_running = true;
g_can_status.last_error = "none";
}

while (true) {
if (g_runtime_mode == RuntimeMode::CAN_LIVE) {
{
std::lock_guard<std::mutex> lock(g_can_status_mutex);
g_can_status.bus_online = true;
g_can_status.rx_ok = true;
g_can_status.tx_ok = true;
g_can_status.last_rx_time = std::chrono::steady_clock::now();
g_can_status.last_tx_time = std::chrono::steady_clock::now();
g_can_status.last_error = "none";
}

{
std::lock_guard<std::mutex> lock(g_state_mutex);
g_state.system.can_status = "live";
g_state.system.mode = "can-live";
g_state.system.connection_status = "connected";
}
}

std::this_thread::sleep_for(std::chrono::milliseconds(50));
}
}).detach();
}
