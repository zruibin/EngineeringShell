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
#include "channel/WebSocketChannel.h"

int main() {
    RunLoopInitMain();
    Log(DEBUG) << "Main Begin.";

    std::shared_ptr<channel::Channel> channelRef = std::make_shared<channel::WebSocketChannel>();
    channelRef->SetClosedHander([](bool closed) {
        if (closed) {
            RunLoopRef ref = RunLoopGetMain();
            ref->isExit = true;
        }
    });
    channelRef->SetReceivedHandler([&](const char* buf,
                                      std::size_t len,
                                      channel::FrameType frameType) {
        if (channelRef) {
            std::string str(buf, len);
            Log(DEBUG) << "Received: " << str;
            channelRef->Send(str);
            if (str == "stop") {
                channelRef->Close();
            }
        }
    });
    channelRef->Open();
    channelRef->AyncRun();
    
    RunLoopRun();
    Log(DEBUG) << "Main End.";
    
    return 0;
}



