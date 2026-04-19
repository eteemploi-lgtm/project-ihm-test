#include "can/can_status.hpp"

#include <sstream>

CanStatus g_can_status;
std::mutex g_can_status_mutex;

std::string can_status_to_json() {
std::lock_guard<std::mutex> lock(g_can_status_mutex);

std::ostringstream oss;
oss << "{"
<< "\"bus_online\":" << (g_can_status.bus_online ? "true" : "false") << ","
<< "\"rx_ok\":" << (g_can_status.rx_ok ? "true" : "false") << ","
<< "\"tx_ok\":" << (g_can_status.tx_ok ? "true" : "false") << ","
<< "\"worker_running\":" << (g_can_status.worker_running ? "true" : "false") << ","
<< "\"last_error\":\"" << g_can_status.last_error << "\""
<< "}";
return oss.str();
}
