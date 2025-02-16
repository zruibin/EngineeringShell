  /*
 *
 * main.cc
 *
 * Created by Ruibin.Chow on 2024/07/05.
 * Copyright (c) 2024年 Ruibin.Chow All rights reserved.
 */

#include <memory>
#include <string>
#include "util/Runloop.h"
#include "log/Logger.h"
#include "channel/Channel.h"

int main() {
    RunLoopInitMain();
    Log(DEBUG) << "Main Begin.";

    auto channelRef = channel::GetChannelRef();
    if (channelRef) {
        channelRef->Open();
        channelRef->AsyncRun();
    }
    
    RunLoopRun();
    Log(DEBUG) << "Main End.";
    
    return 0;
}



