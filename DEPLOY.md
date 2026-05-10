# 部署到 GitHub Pages（无需安装任何工具）

## 一、准备文件
已为你打包好：
```
c:\Users\Administrator\luxe-beauty.zip
```

## 二、创建 GitHub 仓库

1. 打开 [https://github.com/new](https://github.com/new)
2. 填写仓库名（例如 `luxechi-global`），**Public 公开**
3. **不要** 勾选 "Add a README"、".gitignore"、"License"
4. 点击 **Create repository**

## 三、上传文件（两种方式任选）

### 方式 A：网页拖拽（最简单）

1. 在新仓库页面点击 **uploading an existing file** 链接（或 Add file → Upload files）
2. **解压** 上面的 `luxe-beauty.zip`，把里面**所有文件**（不是 luxe-beauty 文件夹本身，而是它里面的内容）拖到上传区
3. 底部 Commit changes → 提交

### 方式 B：GitHub Desktop（如果有）

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. File → Clone 你刚创建的仓库
3. 把 `luxe-beauty` 文件夹里的所有内容复制进克隆下来的目录
4. Commit + Push

## 四、启用 GitHub Pages

1. 仓库页面 → **Settings** 选项卡
2. 左侧菜单 **Pages**
3. **Source** 选择：`Deploy from a branch`
4. **Branch** 选择：`main` / `(root)` → Save
5. 等待 1-2 分钟，页面顶部会出现：
   ```
   Your site is live at https://你的用户名.github.io/仓库名/
   ```

## 五、访问你的站点

- **前台**：`https://你的用户名.github.io/仓库名/`
- **后台**：`https://你的用户名.github.io/仓库名/admin.html`
- **后台默认密码**：`luxe2025`（务必登录后立即修改）

## 六、自定义域名（可选）

若已有自有域名（如 `luxechi.com`）：

1. 在仓库根目录新增一个 `CNAME` 文件，内容为你的域名：
   ```
   luxechi.com
   ```
2. 域名 DNS 处添加 CNAME 记录指向 `你的用户名.github.io`
3. Settings → Pages → Custom domain 填入域名，勾选 Enforce HTTPS

## 后续更新

修改任何文件后，回到 GitHub 仓库网页 → 点击文件 → 编辑/上传新版本 → Commit。
1-2 分钟后线上自动更新。

---

## 备选：Netlify Drop（更简单，不需要 GitHub 账号）

如果觉得 GitHub 麻烦，最简单的是：

1. 访问 [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. 把整个 `luxe-beauty` 文件夹拖入页面
3. 立刻获得 `https://xxx.netlify.app` 永久链接

无需注册（首次会让你创建账号保留站点）。
