/*
 *
 * LogFileManager.h
 *
 * Created by Ruibin.Chow on 2025/02/14.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#ifndef LOG_FILE_MANAGER_H
#define LOG_FILE_MANAGER_H

#include <fstream>

namespace logger {

class LogFileManager
{
public:
    static LogFileManager& GetInstance();
public:
    LogFileManager() = default;
    explicit LogFileManager(const char* fileName);
    ~LogFileManager();
public:
    void Write(const char* string);
    void Flush(void);
    
private:
    std::ofstream *fileStream_;
};

}

#endif /* !LOG_FILE_MANAGER_H */
