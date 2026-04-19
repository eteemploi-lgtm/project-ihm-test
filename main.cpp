#include <iostream>

#include "can/can_runtime.hpp"
#include "transport/websocket_server.hpp"

void start_http_server(); // supposé déjà exister
void start_can_worker(); // défini dans can_worker.cpp
void start_can_watchdog(); // défini dans can_watchdog.cpp

int main() {
std::cout << "Starting Device Server..." << std::endl;

start_can_runtime();
start_can_worker();
start_can_watchdog();

start_websocket_server();
start_http_server();

return 0;
}
