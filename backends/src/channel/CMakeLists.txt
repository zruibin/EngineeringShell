
message("Channel Module.")

set(channel_name channel)

file(GLOB_RECURSE channel_all_file "${src_dir}/channel/*")
sourceGroup("${sourceGroupPrefixName}" ${channel_all_file})

