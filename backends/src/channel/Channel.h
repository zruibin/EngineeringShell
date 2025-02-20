/*
 * Channel.h
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#ifndef CHANNEL_H
#define CHANNEL_H

#include <string>
#include <memory>
#include <functional>

namespace channel {

enum class FrameType {
    kNone = 0,
    kText,
    kBinary,
};

using ReceivedHandler = std::function<void(uint16_t id,
                                           const char* buf,
                                           std::size_t len,
                                           FrameType frameType)>;

using OpenedHander = std::function<void(uint16_t id, bool opened)>;
using ClosedHander = std::function<void(uint16_t id, bool closed)>;
using DestoryHander = std::function<void(bool isDestory)>;

class Channel {
    
public:
    virtual void Open() = 0;
    virtual void Close() = 0;
    virtual void AsyncRun() = 0;
    virtual void Send(uint16_t id, const std::string&) = 0;
    virtual void Send(uint16_t id, const uint8_t*, std::size_t) = 0;
    virtual ~Channel() = default;
    
public:
    virtual void SetReceivedHandler(ReceivedHandler receivedHandler) {
        receivedHandler_ = receivedHandler;
    }
    virtual void SetOpenedHander(OpenedHander openedHander) {
        openedHander_ = openedHander;
    }
    virtual void SetClosedHander(ClosedHander closedHander) {
        closedHander_ = closedHander;
    }
    virtual void SetDestoryHander(DestoryHander destoryHander) {
        destoryHander_ = destoryHander;
    }
    
protected:
    OpenedHander openedHander_{ nullptr };
    ClosedHander closedHander_{ nullptr };
    ReceivedHandler receivedHandler_{ nullptr };
    DestoryHander destoryHander_{ nullptr };
};

std::shared_ptr<channel::Channel> GetChannelRef();

}

#endif /* !CHANNEL_H */
