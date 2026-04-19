#include "managers/can_runtime.hpp"
#include "managers/can_manager.hpp"

#include <thread>
#include <chrono>

static CanManager g_can_manager;

void start_can_runtime() {
    if (!g_can_manager.init()) {
        return;
    }

    std::thread([]() {
        while (true) {
            g_can_manager.poll_once();
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    }).detach();
}