# 姓名笔顺字帖生成器

一个基于 Next.js 的智能汉字字帖生成工具，专为儿童汉字学习和书法练习设计。支持生成个性化的姓名字帖，包含完整的笔顺演示、拼音标注和多种格子样式。

## ✨ 核心功能

### 📝 字帖生成
- **姓名字帖**：输入姓名自动生成个性化练习字帖
- **笔顺演示**：完整的笔画顺序学习，支持逐笔演示
- **多种格子**：田字格、米字格、回宫格三种经典格子样式
- **拼音四线格**：标准四线格拼音练习，等距分布

### 🎨 自定义设置
- **颜色自定义**：5种独立颜色控制
  - 表格线条颜色
  - 汉字颜色  
  - 描字颜色
  - 当前笔顺颜色
  - 完成笔顺颜色
- **布局调整**：每行格子数量、描字行数自由设置
- **本地存储**：用户设置自动保存，刷新页面后保持

### 🖨️ 导出功能
- **预览模式**：实时预览A4纸张效果
- **打印支持**：完美的打印样式，紧贴A4纸边缘
- **PDF下载**：多页PDF生成，保持页眉页脚完整
- **智能分页**：根据内容自动判断是否需要分页

### 📚 汉字信息
- **自动获取**：通过cnchar库获取汉字的拼音、部首、结构信息
- **备用字典**：内置常用汉字数据，确保稳定性
- **信息展示**：完整显示汉字的基本信息

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:9002` 启动

### 构建生产版本
```bash
npm run build
npm run start
```

## 📁 项目结构

```
src/
├── app/                 # Next.js 应用路由
│   ├── globals.css      # 全局样式和打印样式
│   └── page.tsx         # 主页面组件
├── components/          # React 组件
│   ├── ui/              # UI 基础组件
│   ├── SettingsPanel.tsx    # 设置面板
│   ├── WorksheetPreview.tsx # 字帖预览组件
│   ├── TracingCharacterGrid.tsx # 字符练习格子
│   ├── PinyinGrid.tsx   # 拼音四线格
│   └── CharacterInfo.tsx # 汉字信息显示
├── lib/                 # 工具库
│   ├── actions.ts       # 汉字数据获取
│   ├── types.ts         # TypeScript 类型定义
│   └── utils.ts         # 工具函数
└── data/               # 静态数据
    └── characters.json  # 常用汉字字典
```

## 🛠️ 技术栈

### 前端框架
- **Next.js 15.3.3** - React 全栈框架
- **React 18.3.1** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript

### UI 组件
- **Tailwind CSS** - 原子化 CSS 框架
- **Radix UI** - 无样式的可访问组件库
- **Lucide React** - 现代图标库

### 核心功能库
- **cnchar** - 汉字信息处理库
- **cnchar-radical** - 汉字部首插件
- **html2canvas** - HTML 转图片
- **jsPDF** - PDF 生成库

### 开发工具
- **ESLint** - 代码检查
- **PostCSS** - CSS 处理器
- **Turbopack** - 快速打包工具

## 📖 使用指南

### 基本使用
1. **输入姓名**：在左侧设置面板输入要练习的姓名
2. **调整设置**：
   - 选择格子类型（田字格/米字格/回宫格）
   - 设置每行格子数量
   - 调整描字行数
   - 是否显示拼音
3. **颜色自定义**：点击颜色方块调整各种颜色
4. **预览效果**：右侧实时显示生成的字帖
5. **导出使用**：
   - 点击"打印"按钮直接打印
   - 点击"下载PDF"保存为PDF文件

### 智能分页规则
- **3个汉字**：描字行数 ≤ 2 时在一页显示，> 2 时分页
- **2个汉字**：描字行数 ≤ 4 时在一页显示  
- **1个汉字**：描字行数 ≤ 8 时在一页显示
- **4个以上汉字**：自动分页显示

### 颜色设置
- **表格颜色**：控制田字格、米字格、回宫格和拼音四线格的线条
- **汉字颜色**：控制显示和练习的汉字字符
- **描字颜色**：控制描红练习的淡色字符
- **笔顺颜色**：控制当前演示笔画的颜色
- **完成笔顺颜色**：控制已完成笔画的颜色

## 🎯 特色功能

### 笔顺练习逻辑
- **笔画数 ≤ 每行格子数**：创建单行练习序列，重复N次
- **笔画数 > 每行格子数**：创建跨行练习块，每个块包含完整笔顺
- **完整性保证**：绝不渲染半途而废的笔顺序列

### 拼音四线格标准
- 四条线等距分布，三个格子高度相等
- 各占33.33%的垂直空间
- 拼音全部使用小写字母，符合标准规范

### A4纸张适配
- 页眉页脚紧贴纸张边缘，最小化预留空间
- 智能计算内容高度，避免PDF裁切
- 支持预览、打印、PDF三种模式的一致显示

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 版权声明

本项目为原创作品，版权归**英语全科启蒙**、**Terry 校长**所有。

### 使用许可

- ✅ **个人学习使用**：欢迎用于个人学习和交流
- ✅ **教育用途**：可用于教学和教育目的
- ✅ **非营利分享**：可在非营利情况下分享和传播
- ❌ **商业用途**：**严禁用于任何商业用途**
- ❌ **二次销售**：禁止将本项目作为商品进行销售
- ❌ **去除版权**：禁止去除或修改版权信息

### 免责声明

本项目仅供学习交流使用，任何个人或组织使用本项目所产生的任何后果，项目作者不承担任何责任。

### 商业授权

如需商业授权或其他合作，请联系：
- 网站：[英语全科启蒙网站导航](https://web.terry.dpdns.org/)
- 版权所有：英语全科启蒙、Terry 校长

## 🙏 致谢

- [cnchar](https://github.com/theajack/cnchar) - 汉字处理库
- [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) - 汉字笔顺数据
- [Radix UI](https://www.radix-ui.com/) - 无障碍UI组件
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

## 📞 联系方式

- 项目地址：[GitHub](https://github.com/your-username/worksheet-generator)
- 问题反馈：[Issues](https://github.com/your-username/worksheet-generator/issues)
- 网站导航：[https://web.terry.dpdns.org/](https://web.terry.dpdns.org/)

---

**版权所有：英语全科启蒙、Terry 校长** | **仅供学习交流，禁止商用**

**英语全科启蒙网站导航**: [https://web.terry.dpdns.org/](https://web.terry.dpdns.org/)