# Prophouse Jenkins发布流程


1. 选择要发布的代码所在的branch，创建新tag：
 https://github.com/metaforo/Realm-Frontinus-House/releases/new

	1. 输入tag名。建议格式：v231207、v231207-2
	2. 点击“Create new tag: v231207”，创建新tag
	3. 点击Publish release发布

3. 登录Jenkins：
https://admin.metaforo.io/login
	1. 进入要发布的项目，例如：【frontinus.house】 stage-backend-update
	2. 点击Build with Parameters，选择刚刚新建的tag，点击build按钮
	3. 在Build History列表中查看build结果
