#pragma once

#include "models/can_frame.hpp"

#include <queue>
#include <mutex>
#include <condition_variable>

class CanQueue {
public:
void push(const CanFrame& frame);
bool try_pop(CanFrame& frame);
CanFrame wait_and_pop();

private:
std::queue<CanFrame> queue_;
std::mutex mutex_;
std::condition_variable cv_;
};
