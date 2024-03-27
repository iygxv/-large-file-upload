# 大文件上传

## 文件上传有两套方案
- 基于文件流（form-data） --- element-ui上传组件默认是基于文件流的
- 将文件转化为base64再上传

## 基于文件流（form-data）方式上传

```vue
<template>
  <div id="app">
    <!-- action:存放的是文件上传到服务器的接口地址  -->
    <el-upload
      drag
      action="文件上传到服务器的接口地址"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
    </el-upload>

    <!-- 展示上传的图片 -->
    <div class="uploadImg" v-if="img">
      <img :src="img" alt />
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      img: null,
    };
  },
  methods: {
    handleSuccess(result) {
      if (result.code == 200) {
        this.img = result.path;
      }
    },
    beforeUpload(file) {
      // 格式校验
      let { type, size } = file;

      if (!/(png|gif|jpeg|jpg)/i.test(type)) {
        this.$message("文件格式不正确");
        return false;
      }

      if (size > 10* 1024 * 1024) {
        this.$message("文件过大，请上传小于10MB的文件");
        return false;
      }

      return true;
    },
  },
};
</script>


```

## 将文件转化为base64再上传

上传步骤：

- 上传的文件先进行解析（FileReader）
- 把其转换base64编码格式
- 自己基于axios把信息传递给服务器

相关代码

```vue
<template>
  <div id="app">
    <el-upload drag action :auto-upload="false" :show-file-list="false" :on-change="changeFile">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
    </el-upload>

    <!-- IMG -->
    <div class="uploadImg" v-show="img">
      <img :src="img" alt />
    </div>
  </div>
</template>

<script>
import { fileParse } from "./assets/utils";
import axios from "axios";
import qs from "qs";

const fileParse = (file, type = "base64") => {
  return new Promise(resolve => {
      // FileReader 对象允许 Web 应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，
      // 使用 File 或 Blob 对象指定要读取的文件或数据。
        let fileRead = new FileReader();
        if (type === "base64") {
            fileRead.readAsDataURL(file);
        } else if (type === "buffer") {
            fileRead.readAsArrayBuffer(file);
        }
        fileRead.onload = (ev) => {
            resolve(ev.target.result);
        };
    });
}

export default {
  name: "App",
  data() {
    return {
      img: null,
    };
  },
  methods: {
    async changeFile(file) {
      if (!file) return;
      file = file.raw;
      let result = await fileParse(file, "base64");
      result = await axios.post(
        "文件上传到服务器的接口地址",
        qs.stringify({
          chunk: encodeURIComponent(result), // 
          filename: file.name,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      result = result.data;
      if (result.code == 0) {
        this.img = result.path;
      }
    },
  },
};
</script>
```

## 大文件上传和断点续传

上传步骤：

- 将文件信息解析为Buffer数据
- 将文件切片处理：把一个文件分割成为好几个部分（固定数量/固定大小）
- 每一个切片有自己的部分数据和自己的名字（hash_1.mp4、hash_2.mp4）
