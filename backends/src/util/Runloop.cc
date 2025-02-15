/*
 *
 * runloop.c
 *
 * Created by Ruibin.Chow on 2024/09/13.
 * Copyright (c) 2024年 Ruibin.Chow All rights reserved.
 */

#include "Runloop.h"
#include <thread>
#include <chrono>
#include <unordered_map>

static std::unordered_map<RunLoopID, RunLoopRef> __runloopMap;
static uint32_t __mainID = 0;

RunLoopID RunLoopGetID(void) {
    return util::GetCurrentThreadId();
}

RunLoopRef RunLoopGetCurrent(void) {
    return __runloopMap[RunLoopGetID()];
}

RunLoopRef RunLoopGetMain(void) {
    return __runloopMap[__mainID];
}

bool RunLoopIsWaiting(RunLoopRef rl) {
    return false;
}

void RunLoopWakeUp(RunLoopRef rl) {
    
}

void RunLoopStop(RunLoopRef rl) {
    
}

void RunLoopInitMain(void) {
    __mainID = util::GetCurrentThreadId();
}

void RunLoopRun(void) {
    uint32_t threadId = util::GetCurrentThreadId();
    if (__runloopMap.find(threadId) != __runloopMap.end()) {
        return;
    }
    RunLoopRef runloopRef = new RunLoop();
    runloopRef->id = threadId;
    __runloopMap.try_emplace(threadId, runloopRef);
    
    while (true) {
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        if (runloopRef->isExit) {
            break;
        }
    }
}

