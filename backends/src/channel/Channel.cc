/*
 *
 * Channel.cc
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#include "Channel.h"
#include "log/Logger.h"
#include "util/Runloop.h"
#include "WebSocketChannel.h"

namespace channel {

std::shared_ptr<channel::Channel> GetChannelRef() {
    std::shared_ptr<channel::Channel> channelRef = std::make_shared<channel::WebSocketChannel>();
    channelRef->SetDestoryHander([](bool isDestory) {
        if (isDestory) {
            RunLoopRef ref = RunLoopGetMain();
            if (ref) ref->isExit = true;
        }
    });
    channelRef->SetReceivedHandler([&](uint16_t id,
                                        const char* buf,
                                        std::size_t len,
                                        channel::FrameType frameType) {
        if (channelRef) {
            std::string str(buf, len);
            Log(DEBUG) << "id: " << id << " Received: " << str;
            logger::SetLoggerFile(str);
            channelRef->Send(id, str);
            if (str == "stop") {
                channelRef->Close();
            }
        }
    });

    return channelRef;
}

}

