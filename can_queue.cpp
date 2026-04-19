#include "can/can_queue.hpp"

void CanQueue::push(const CanFrame& frame) {
{
std::lock_guard<std::mutex> lock(mutex_);
queue_.push(frame);
}
cv_.notify_one();
}

bool CanQueue::try_pop(CanFrame& frame) {
std::lock_guard<std::mutex> lock(mutex_);
if (queue_.empty()) {
return false;
}

frame = queue_.front();
queue_.pop();
return true;
}

CanFrame CanQueue::wait_and_pop() {
std::unique_lock<std::mutex> lock(mutex_);
cv_.wait(lock, [this]() { return !queue_.empty(); });

CanFrame frame = queue_.front();
queue_.pop();
return frame;
}
