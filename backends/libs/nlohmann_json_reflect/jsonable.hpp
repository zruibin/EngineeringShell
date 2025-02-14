/*
 * jsonable.hpp
 *
 * Created by Ruibin.Chow on 2024/07/24.
 * Copyright (c) 2024年 Ruibin.Chow All rights reserved.
 */

#ifndef JSONABLE_HPP
#define JSONABLE_HPP

#include <random>
#include <limits>
#include <nlohmann/json.hpp>
#include <nlohmann_json_reflect/json_reflect.hpp>

#define FIELDS_REFLECT(...)  REFLECT_INTRUSIVE(__VA_ARGS__)
#define FIELDS_MAP(...)  std::unordered_map<jString, jString> GetReplaceMap() override { \
                                return {__VA_ARGS__};\
                        };

#define JSONABLE_STRUCT(STRUCT_NAME) \
            struct STRUCT_NAME : Jsonable<STRUCT_NAME>

namespace {

using json = nlohmann::json;
using jString = std::string;

int32_t GenerateID() {
    std::random_device sd;
    std::minstd_rand linear(sd());
    std::uniform_int_distribution<int32_t> dist(0, std::numeric_limits<int32_t>::max());
    return dist(linear);
}

jString Replace(const jString& strSrc,
                const jString& oldStr,
                const jString& newStr,
                int count=-1) {
    jString strRet{ strSrc };
    size_t pos = 0;
    int l_count = 0;
    if(-1 == count) // replace all
        count = strRet.size();
    while ((pos = strRet.find(oldStr, pos)) != std::string::npos) {
        strRet.replace(pos, oldStr.size(), newStr);
        if(++l_count >= count) break;
        pos += newStr.size();
    }
    return strRet;
}

}

template<typename T>
struct Jsonable {
    virtual ~Jsonable() = default;
    virtual std::unordered_map<jString, jString> GetReplaceMap() { return {}; };
    
    virtual std::string ToJsonString(int indent = jreflect::INDENT) {
        T* value = static_cast<T *>(this);
        jString jsonString{ jreflect::to_json(*value, indent) };
        for (auto& [k, v] : GetReplaceMap()) {
            jsonString = Replace(jsonString, k, v);
        }
        return jsonString;
    }
    
    virtual void FromJsonString(const jString& jsonString) {
        T* value = static_cast<T *>(this);
        jString jsonStr{ jsonString };
        for (auto& [k, v] : GetReplaceMap()) {
            jsonStr = Replace(jsonStr, v, k);
        }
        *value = jreflect::from_json<T>(jsonStr);
    }
};

#endif /* !JSONABLE_HPP */
