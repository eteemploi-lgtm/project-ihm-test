#pragma once

#include <string>
#include <mutex>
#include <chrono>

struct CanStatus {
bool bus_online = false;
bool rx_ok = false;
bool tx_ok = false;
bool worker_running = false;

std::string last_error = "none";

std::chrono::steady_clock::time_point last_rx_time{};
std::chrono::steady_clock::time_point last_tx_time{};
};

extern CanStatus g_can_status;
extern std::mutex g_can_status_mutex;

std::string can_status_to_json();
