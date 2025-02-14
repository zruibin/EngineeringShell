 ## Sync

如果只是加载文件的一部份，如开头100个字节，结尾100个字节等办法
文件打开读取要用二进制方式，文件传输也要用二进制方式。
文件大小 + 抽样（头、中、尾或每隔xx字节抽样一次）哈希


exclude



action: 
    0: unknow
    1: add
    2: delete
    3: update

from->to
1、对比文件存在
2、对比文件大小
3、对比文件hash值


[
    {
        "dir": "//Community/MagicDanmaku/assets/resources",
        "file": "img.meta",
        "hash": "iwewhswfsfkleweoweiii"
        "action": 0
    },
]


diff

> * 会对新旧 VNode 进行对比，也就是我们所说的Diff算法。
> * 对新旧两棵树进行一个深度优先遍历，这样每一个节点都会一个标记，在到深度遍历的时候，每遍历到一和个节点，就把该节点和新的节点树进行对比，如果有差异就放到一个对象里面
> * 遍历差异对象，根据差异的类型，根据对应对规则更新VNode

[

]

sync



## C++中解析.gitignore文件

Git忽略规则：深入解析.gitignore配置
https://developer.baidu.com/article/details/3311663
https://zhuanlan.zhihu.com/p/696720557

在C++中解析.gitignore文件可以通过逐行读取文件并根据规则排除文件或目录来实现。以下是一个简单的示例代码，展示了如何解析.gitignore文件并排除与规则匹配的文件。

```cpp
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <regex>

// 解析.gitignore规则并排除匹配文件
void excludeGitignoreFiles(const std::string &gitignorePath, const std::string &directoryPath) {
    std::ifstream file(gitignorePath);
    std::string line;
    std::vector<std::regex> ignorePatterns;

    // 读取.gitignore文件并解析规则
    while (std::getline(file, line)) {
        // 忽略以#开头的注释行
        if (!std::regex_match(line, std::regex("^\\s*#"))) {
            // 将规则转换为正则表达式
            std::string pattern = std::regex_replace(line, std::regex("\\*"), "[^/]*");
            ignorePatterns.emplace_back(pattern);
        }
    }

    // 遍历目录下的文件
    for (const auto &entry : std::filesystem::directory_iterator(directoryPath)) {
        bool exclude = false;
        std::string filename = entry.path().filename().string();

        // 检查文件名是否与规则匹配
        for (const auto &pattern : ignorePatterns) {
            if (std::regex_match(filename, pattern)) {
                exclude = true;
                break;
            }
        }

        // 如果文件被排除，打印信息或执行排除操作
        if (exclude) {
            std::cout << "Excluding: " << filename << std::endl;
            // 执行排除操作，例如删除文件或重命名等
        }
    }
}

int main() {
    std::string gitignorePath = ".gitignore";
    std::string directoryPath = ".";
    excludeGitignoreFiles(gitignorePath, directoryPath);
    return 0;
}
```

这段代码使用C++11标准中引入的文件系统库<filesystem>，正则表达式库<regex>，以及流和字符串处理库。它定义了一个excludeGitignoreFiles函数，该函数接受.gitignore文件的路径和需要排除文件的目录路径作为参数。函数读取.gitignore文件中的每一行，将其转换成正则表达式，然后对指定目录下的每个文件进行匹配，如果文件匹配任何规则，则将其排除。

请注意，这个示例没有包含排除文件的实际操作，仅仅是打印出被排除的文件名。在实际应用中，你需要根据需求实现相应的排除操作，例如删除文件或重命名等。此外，这个示例不支持.gitignore文件中的路径排除规则，只处理了文件名的规则。如果需要处理路径排除规则，代码还需要相应的扩展。

<hr/>







