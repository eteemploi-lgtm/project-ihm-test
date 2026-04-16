#pragma once
#include "../models/global_state.hpp"

class StateManager {
public:
    StateManager();

    GlobalState& state();
    const GlobalState& state() const;
    void refresh_snapshot();

private:
    GlobalState global_state_;
};
