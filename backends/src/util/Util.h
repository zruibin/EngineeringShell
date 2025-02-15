/*
 *
 * Util.h
 *
 * Created by Ruibin.Chow on 2025/02/14.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#ifndef UTIL_H
#define UTIL_H

#include <cstdint>
#include <string>


namespace util {

std::string GetCurrentTimestampString(int time_stamp_type = 0);
std::string GetCurrentTimeString(void);
int64_t GetCurrentTimeSeconds(void);
int64_t GetCurrentTimeMilliseconds(void);

const char* GetRandomString(int32_t len);
const char* GetCurrentThreadName();
uint32_t GetCurrentThreadId(void);

}


#endif /* !UTIL_H */
