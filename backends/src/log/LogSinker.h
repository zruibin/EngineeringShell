/*
 * LogSinker.h
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#ifndef LOGSINKER_H
#define LOGSINKER_H

#include <memory>
#include <queue>
#include <mutex>
#include <thread>
#include <atomic>
#include <condition_variable>
#include <string>

namespace logger {

class LogSinker final {
public:
    static LogSinker& GetInstance();
    explicit LogSinker();
    void Write(const char* string);
    
public:
    std::atomic<bool> isReady{ false };
    
private:
    std::unique_ptr<std::thread> logThread_;
    std::unique_ptr<std::queue<std::string>> logQueue_;
    std::mutex mutex_;
    std::condition_variable cv_;
};

}


#endif /* !LOGSINKER_H */
