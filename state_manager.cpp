#include "../../include/managers/state_manager.hpp"

StateManager::StateManager() : global_state_() {}

GlobalState& StateManager::state() {
    return global_state_;
}

const GlobalState& StateManager::state() const {
    return global_state_;
}

void StateManager::refresh_snapshot() {
    // TODO: hook lecture devices réelle
}
