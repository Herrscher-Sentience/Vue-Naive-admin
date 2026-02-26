# 同学录项目架构规划

## 项目概述

同学录是一个包含管理端、后端服务和移动APP的完整应用系统。

| 端| 技术栈 | 项目名称 |
|------|--------|----------|
| 管理端 | Vue3 + Naive UI + Vite | vue-naive-admin |
| 后端 | NestJS + TypeORM/Prisma | classmate-book-server |
| APP端 | 鸿蒙原生 (ArkTS) | ClassmateBookApp |

---

## 一、项目目录结构

```
classmate-book/                          # 项目根目录
├── admin/                               # 管理端 (Vue3)
│├── src/
│   ├── api/                          # API 接口
│   │   ├── classmate.js              # 同学管理接口
│   │   ├── album.js                  # 相册管理接口
│   │   ├── message.js                # 留言管理接口
│   │   ├── activity.js               # 活动管理接口
│   │   └── ...
│   ├── views/
│   │   ├── classmate/                # 同学管理页面
│   │   │   ├── index.vue             # 同学列表
│   │   │   ├── components/
│   │   │   │   └── ClassmateModal.vue
│   │   │   └── api.js
│   │   ├── album/                    # 相册管理页面
│   │   │   ├── index.vue
│   │   │   └── api.js
│   │   ├── message/                  # 留言墙管理
│   │   │   ├── index.vue
│   │   │   └── api.js
│   │   ├── activity/                 # 活动管理
│   │   │   ├── index.vue
│   │   │   └── api.js
│   │   └── statistics/               # 数据统计
│   │       └── index.vue
│   └── ...
│
├── server/                              # 后端服务 (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── user/                 # 用户模块
│   │   │   │   ├── user.module.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── classmate/            # 同学模块
│   │   │   │   ├── classmate.module.ts
│   │   │   │   ├── classmate.controller.ts
│   │   │   │   ├── classmate.service.ts
│   │   │   │   ├── classmate.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── album/                # 相册模块
│   │   │   │   ├── album.module.ts
│   │   │   │   ├── album.controller.ts
│   │   │   │   ├── album.service.ts
│   │   │   │   ├── album.entity.ts
│   │   │   │   ├── photo.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── message/              # 留言模块
│   │   │   │   ├── message.module.ts
│   │   │   │   ├── message.controller.ts
│   │   │   │   ├── message.service.ts
│   │   │   │   ├── message.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── activity/             # 活动模块
│   │   │   │   ├── activity.module.ts
│   │   │   │   ├── activity.controller.ts
│   │   │   │   ├── activity.service.ts
│   │   │   │   ├── activity.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── class/                # 班级模块
│   │   │   │   ├── class.module.ts
│   │   │   │   ├── class.controller.ts
│   │   │   │   ├── class.service.ts
│   │   │   │   ├── class.entity.ts
│   │   │   │   └── dto/
│   │   │   └── auth/                 # 认证模块
│   │   │       ├── auth.module.ts
│   │   │       ├── auth.controller.ts
│   │   │       ├── auth.service.ts
│   │   │       ├── jwt.strategy.ts
│   │   │       └── dto/
│   │   ├── common/
│   │   │   ├── decorators/           # 自定义装饰器
│   │   │   ├── filters/              # 异常过滤器
│   │   │   ├── guards/               # 守卫
│   │   │   ├── interceptors/         # 拦截器
│   │   │   ├── pipes/                # 管道
│   │   │   └── dto/                  # 通用DTO
│   │   ├── config/                   # 配置文件
│   │   ├── database/                 # 数据库相关
│   │   │   ├── migrations/           # 迁移文件
│   │   │   └── seeds/                # 种子数据
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma             # Prisma Schema
│   ├── package.json
│   └── ...
│
└── app/                                 # 鸿蒙APP
    ├── entry/
    │   ├── src/
    │   │   ├── main/
    │   │   │   ├── ets/
    │   │   │   │   ├── entryability/
    │   │   │   │   │   └── EntryAbility.ts
    │   │   │   │   ├── pages/        # 页面
    │   │   │   │   │   ├── Index.ets # 首页
    │   │   │   │   │   ├── Login.ets # 登录页
    │   │   │   │   │   ├── ClassmateList.ets  # 同学列表
    │   │   │   │   │   ├── ClassmateDetail.ets # 同学详情
    │   │   │   │   │   ├── AlbumList.ets      # 相册列表
    │   │   │   │   │   ├── AlbumDetail.ets    # 相册详情
    │   │   │   │   │   ├── MessageWall.ets    # 留言墙
    │   │   │   │   │   ├── ActivityList.ets   # 活动列表
    │   │   │   │   │   └── Profile.ets        # 个人中心
    │   │   │   │   ├── components/  # 组件
    │   │   │   │   │   ├── ClassmateCard.ets
    │   │   │   │   │   ├── PhotoGrid.ets
    │   │   │   │   │   ├── MessageItem.ets
    │   │   │   │   │   └── ActivityCard.ets
    │   │   │   │   ├── models/      # 数据模型
    │   │   │   │   │   ├── Classmate.ets
    │   │   │   │   │   ├── Album.ets
    │   │   │   │   │   ├── Photo.ets
    │   │   │   │   │   ├── Message.ets
    │   │   │   │   │   └── Activity.ets
    │   │   │   │   ├── services/    # 服务
    │   │   │   │   │   ├── Api.ets  # API服务
    │   │   │   │   │   ├── AuthService.ets
    │   │   │   │   │   └── StorageService.ets
    │   │   │   │   ├── utils/       # 工具函数
    │   │   │   │   │   ├── Http.ets
    │   │   │   │   │   └── Common.ets
    │   │   │   │   └── viewmodels/  # 视图模型
    │   │   │   │       ├── ClassmateViewModel.ets
    │   │   │   │       └── AlbumViewModel.ets
    │   │   │   ├── resources/       # 资源文件
    │   │   │   │   ├── base/
    │   │   │   │   │   ├── media/   # 图片资源
    │   │   │   │   │   └── element/ # 字符串、颜色等
    │   │   │   │   └── rawfile/     # 原始文件
    │   │   │   └── module.json5
    │   │   └── ohosTest/
    │   └── build-profile.json5
    ├── build-profile.json5
    ├── hvigorfile.ts
    ├── oh-package.json5
    └── ...
```

---

## 二、数据库设计

### 核心实体关系

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User│────<│   ClassMember   │>────│   Class│
└─────────────┘     └─────────────────┘     └─────────────┘
││         │ │
│                   │ role, joinTime   │                   │
│                   └─────────────────┘                   │
││
│┌─────────────┐
├───────────────────│  Classmate   │
│                   └─────────────┘
│                   │             │
│┌─────────────┐┌─────────────┐
├───────────────────│   Album│├───────────────────│  Message   │
│                   └─────────────┘                   └─────────────┘
││
│┌─────────────┐
├───────────────────│  Activity   │
│                   └─────────────┘
│
┌─────────────┐
│  Photo│
└─────────────┘
```

### 数据表设计

#### 1. 用户表 (user)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | varchar(50) | 用户名 |
| password | varchar(255) | 密码(加密) |
| nickname | varchar(50) | 昵称 |
| avatar | varchar(500) | 头像URL |
| phone | varchar(20) | 手机号 |
| email | varchar(100) | 邮箱 |
| status | enum | 状态(active/inactive/banned) |
| role | enum | 角色(admin/member) |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

#### 2. 班级表 (class)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | varchar(100) | 班级名称 |
| school | varchar(200) | 学校名称 |
| grade | varchar(50) | 年级 |
| year | int | 入学年份 |
| description | text | 班级描述 |
| coverImage | varchar(500) | 封面图片 |
| creatorId | UUID | 创建者ID |
| createdAt | timestamp | 创建时间 |

#### 3. 同学表 (classmate)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 关联用户ID (可选) |
| classId | UUID | 关联班级ID |
| name | varchar(50) | 姓名 |
| avatar | varchar(500) | 头像 |
| gender | enum | 性别 |
| birthday | date | 生日 |
| phone | varchar(20) | 手机号 |
| email | varchar(100) | 邮箱 |
| wechat | varchar(50) | 微信号 |
| qq | varchar(20) | QQ号 |
| address | varchar(500) | 现居地址 |
| company | varchar(200) | 工作单位 |
| position | varchar(100) | 职位 |
| hobby | text | 爱好 |
| bio | text | 个人简介 |
| photos | json | 照片数组 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

#### 4. 相册表 (album)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| classId | UUID | 班级ID |
| title | varchar(200) | 相册标题 |
| description | text | 相册描述 |
| coverImage | varchar(500) | 封面图片 |
| creatorId | UUID | 创建者ID |
| isPublic | boolean | 是否公开 |
| createdAt | timestamp | 创建时间 |

#### 5. 照片表 (photo)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| albumId | UUID | 相册ID |
| url | varchar(500) | 图片URL |
| thumbnail | varchar(500) | 缩略图URL |
| description | varchar(500) | 照片描述 |
| tags | json | 标签(人物等) |
| uploadUserId | UUID | 上传者ID |
| takenAt | timestamp | 拍摄时间 |
| createdAt | timestamp | 上传时间 |

#### 6. 留言表 (message)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| classId | UUID | 班级ID |
| userId | UUID | 留言用户ID |
| content | text | 留言内容 |
| images | json | 图片数组 |
| likes | int | 点赞数 |
| isAnonymous | boolean | 是否匿名 |
| createdAt | timestamp | 创建时间 |

#### 7. 活动表 (activity)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| classId | UUID | 班级ID |
| title | varchar(200) | 活动标题 |
| description | text | 活动描述 |
| coverImage | varchar(500) | 封面图片 |
| location | varchar(500) | 活动地点 |
| startTime | timestamp | 开始时间 |
| endTime | timestamp | 结束时间 |
| status | enum | 状态(draft/published/ongoing/ended) |
| creatorId | UUID | 创建者ID |
| createdAt | timestamp | 创建时间 |

#### 8. 活动报名表 (activity_registration)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| activityId | UUID | 活动ID |
| classmateId | UUID | 同学ID |
| status | enum | 状态(registered/cancelled/attended) |
| remark | varchar(500) | 备注 |
| createdAt | timestamp | 报名时间 |

---

## 三、API 接口设计

### 基础路径
- 管理端API: `/api/admin/*`
- APP端API: `/api/app/*`
- 公共API: `/api/common/*`

### 接口列表

#### 认证模块
```
POST   /api/auth/login          # 登录
POST   /api/auth/register       # 注册
POST   /api/auth/logout         # 登出
POST   /api/auth/refresh        # 刷新Token
GET    /api/auth/profile        # 获取当前用户信息
```

#### 同学管理
```
GET    /api/app/classmate       # 获取同学列表(支持分页、搜索)
GET    /api/app/classmate/:id   # 获取同学详情
POST   /api/admin/classmate     # 创建同学信息
PUT    /api/admin/classmate/:id # 更新同学信息
DELETE /api/admin/classmate/:id # 删除同学信息
GET    /api/app/classmate/birthdays # 获取近期生日同学
```

#### 相册管理
```
GET    /api/app/album           # 获取相册列表
GET    /api/app/album/:id       # 获取相册详情
POST   /api/app/album           # 创建相册
PUT    /api/app/album/:id       # 更新相册
DELETE /api/app/album/:id       # 删除相册
POST   /api/app/album/:id/photos # 上传照片
DELETE /api/app/photo/:id       # 删除照片
```

#### 留言墙
```
GET    /api/app/message         # 获取留言列表
POST   /api/app/message         # 发表留言
DELETE /api/app/message/:id     # 删除留言
POST   /api/app/message/:id/like # 点赞
```

#### 活动管理
```
GET    /api/app/activity        # 获取活动列表
GET    /api/app/activity/:id    # 获取活动详情
POST   /api/admin/activity      # 创建活动
PUT    /api/admin/activity/:id  # 更新活动
DELETE /api/admin/activity/:id  # 删除活动
POST   /api/app/activity/:id/register # 报名活动
DELETE /api/app/activity/:id/register # 取消报名
```

#### 统计分析
```
GET    /api/admin/statistics/overview  # 总览数据
GET    /api/admin/statistics/classmate # 同学统计
GET    /api/admin/statistics/activity  # 活动统计
```

---

## 四、开发计划

### 第一阶段：基础架构搭建 (1-2周)

#### 后端 (NestJS)
- [ ] 项目初始化
- [ ] 数据库配置 (PostgreSQL/MySQL)
- [ ] 用户认证模块 (JWT)
- [ ] 基础CRUD封装
- [ ] 文件上传服务

#### 管理端 (Vue3)
- [ ] 基于现有框架调整
- [ ] 同学管理页面
- [ ] 权限配置

#### APP端 (鸿蒙)
- [ ] 项目初始化
- [ ] 网络请求封装
- [ ] 路由配置
- [ ] 登录页面

### 第二阶段：核心功能开发 (2-3周)

- [ ] 同学信息管理 (CRUD)
- [ ] 相册功能
- [ ] 留言墙
- [ ] 个人中心

### 第三阶段：扩展功能 (1-2周)

- [ ] 活动管理
- [ ] 消息通知
- [ ] 数据统计
- [ ] 搜索功能

### 第四阶段：优化与上线 (1周)

- [ ] 性能优化
- [ ] 安全加固
- [ ] 测试
- [ ] 部署上线

---

## 五、技术要点

### 管理端 (Vue3)
- 使用现有的 vue-naive-admin 框架
- Naive UI 组件库
- Pinia 状态管理
- Vue Router 路由
- Axios 请求封装

### 后端 (NestJS)
- TypeORM 或 Prisma ORM
- JWT 认证
- Swagger API 文档
- 配置管理 (@nestjs/config)
- 文件上传 (multer)
- 日志系统

### APP端 (鸿蒙)
- ArkTS 开发语言
- ArkUI 组件库
- HTTP 网络请求
- Preferences 本地存储
- 图片选择/拍照
- 推送通知

---

## 六、部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (反向代理)                      │
└─────────────────────────────────────────────────────────────┘
││
┌───────────────────┐┌───────────────────┐
│  静态资源(管理端)   ││   API服务(后端)    │
│  Vue3 Build       ││   NestJS          │
└───────────────────┘└───────────────────┘
│
┌───────────────────┐┌───────────────────┐
│   PostgreSQL      ││   对象存储(OSS)    │
│   数据库││   图片/文件存储     │
└───────────────────┘└───────────────────┘
```

---

## 七、下一步行动

1. **创建后端项目** - 在同级目录创建 `classmate-book-server`
2. **创建鸿蒙APP项目** - 在同级目录创建 `ClassmateBookApp`
3. **设计数据库** - 完善实体关系和字段
4. **定义API规范** - 编写 OpenAPI/Swagger 文档
5. **开始开发** - 按阶段推进

是否需要我帮你创建后端项目或鸿蒙APP项目的基础结构？
