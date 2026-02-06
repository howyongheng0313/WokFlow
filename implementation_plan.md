# 实施计划: 区分 Sharer 和 Learner 注册状态

## 目标
解决用户反馈的 "切换角色时表单未刷新" 问题，并确保所有输入框状态受控。

## 阶段 1: 状态管理重构 (RegisterView)
- [x] **定义状态结构**:
  创建一个 `RegisterFormState` 接口和初始状态对象 `initialFormState`。
  ```typescript
  {
      fullName: '',
      email: '',
      birthDate: '',
      country: '',
      password: '',
      confirmPassword: '',
      uploadedFile: null // File object or name
  }
  ```
- [x] **转换组件**:
  - [x] 使用 `useState<RegisterFormState>(initialFormState)`。
  - [x] 为所有 `<input>` 添加 `value` 和 `onChange` 处理函数。
  - [x] `uploadedFile` 特殊处理 (保持原有的 ref 逻辑，但同步到 state)。

## 阶段 2: 角色切换逻辑
- [x] **重置副作用**:
  - [x] 添加 `useEffect` 依赖于 `selectedRole`。
  - [x] 在 effect 中调用 `setFormState(initialFormState)` 清空表单。
  - [x] 同时重置 `showPassword` 和 `showConfirmPassword` 为 false。

## 验证计划
- [x] **交互测试**:
  1. 选择 'Learner'，在所有字段输入内容。
  2. 点击 'Sharer' 切换。
  3. 验证所有字段是否变为空白。
  4. 输入 'Sharer' 特有的内容 (如上传文件)。
  5. 切换回 'Learner'，验证文件和输入是否清空。
