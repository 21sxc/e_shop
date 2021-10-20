<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList"
                border
                stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格布局 -->
            <el-row v-for="(item1, i1) in scope.row.children"
                    :key="item1.id"
                    :class="[ 'bdbottom', i1 === 0 ? 'bdtop' : '' , 'vcenter']"
                    closable>
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '':'bdtop', 'vcenter']"
                        v-for="(item2, i2) in item1.children"
                        :key="item2.id"
                        closable>
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row, item2.id)">{{item2.authName}} </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 通过for循环嵌套渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children"
                            :key="item3.id"
                            type="warning"
                            closable
                            @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showRoleEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeRoleById(scope.row.id)">删除</el-button>
            <!-- 分配按钮 -->
            <el-button type="warning"
                       icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户的对话框模块 -->
    <el-dialog title="添加用户"
               :visible.sync="addRoleDialogVisible"
               width="50%"
               @close="addRoleDialogClose">
      <!-- 内容主题区域 -->
      <!-- 对话框表单start -->
      <el-form :model="addRoleList"
               :rules="addRoleListRules"
               ref="addRoleListRef"
               label-width="100px">
        <el-form-item label="角色名称"
                      prop="roleName">
          <el-input v-model="addRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述"
                      prop="roleDesc">
          <el-input v-model="addRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加用户的对话框模块end -->
    <!-- 修改用户的对话框 -->
    <el-dialog title="编辑用户"
               :visible.sync="editRoleDialogVisible"
               width="50%"
               @close="editRoleDialogClose">
      <el-form :model="editRoleForm"
               :rules="editRoleFormRules"
               ref="editRoleFormRef"
               label-width="100px">
        <el-form-item label="角色名称"
                      prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述"
                      prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框end -->
    <!-- 分配权限的对话框 -->
    <el-dialog title="提示"
               :visible.sync="setRightDialogVisable"
               width="50%"
               @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree :data="rightList"
               :props="treeProps"
               show-checkbox
               node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRightDialogVisable = false">取 消</el-button>
        <el-button type="primary"
                   @click="allotRight ">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框end -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      //角色列表
      rolesList: [],
      //添加角色的表单数据
      addRoleList: {
        roleName: '',
        roleDesc: '',
      },
      //权限列表
      rightList: [],
      //控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      //控制编辑角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisable: false,
      //添加角色的验证规则对象
      addRoleListRules: {
        //验证角色名称是否合法
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证角色描述是否合法
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 0, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
      },
      //查询到的用户信息对象
      editRoleForm: {},
      editRoleFormRules: {
        //验证角色名称是否合法
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证角色描述是否合法
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 0, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
      },
      //树形空间的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      //默认选中的节点id数
      defKeys: [],
      //当前即将分配权限的id
      roleId: '',
    }
  },
  created () {
    //获取所有角色
    this.getRolesList()
  },
  methods: {
    //获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      // console.log(this.rolesList);
    },
    //添加角色
    addRole () {
      this.$refs.addRoleListRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleList)
        if (res.meta.status !== 201) {
        return  this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
    //展示编辑角色的对话框
    async showRoleEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status != 200) {
        return this.$message.error('该用户不存在')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    //修改用户信息并提交
    editRoleInfo () {
      this.$refs.editRoleFormRef.validate(async valid => {
        //预校验失败
        if (!valid) return
        //发起修改用户信息的数据请求
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败')
        }
        //关闭对话框
        this.editRoleDialogVisible = false
        //刷新数据列表
        this.getRolesList()
        this.$message.success('更新角色信息成功')
      })
    },
    //监听添加角色对话框的关闭事件
    addRoleDialogClose () {
      this.$refs.addRoleListRef.resetFields()
    },
    //监听修改对话框的关闭事件
    editRoleDialogClose () {
      this.$refs.editRoleFormRef.resetFields()
    },
    //根据id删除角色信息
    async removeRoleById (id) {
      //弹框询问角色是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //如果角色确认删除，则返回值为字符串confirm
      //如果角色取消删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getRolesList()
    },
    //根据id删除对应的权限
    async removeRightById (role, rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //如果角色确认删除，则返回值为字符串confirm
      //如果角色取消删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      //获取所有权限的处理
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
       return this.$message.error('获取权限失败')
      }
      this.$message.success('获取权限成功')
      //获取到的权限数据保存到data中
      this.rightList = res.data
      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisable = true
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys (node, arr) {
      //如果当前节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClose (roleId) {
      this.defKeys = [roleId]
    },
    //点击为角色分配权限
    async allotRight () {
      const keys = [
        ...this.$refs.treeRef.
          getCheckedKeys(),
        ...this.$refs.treeRef.
          getHalfCheckedKeys()
      ]
      console.log(keys);
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配角色成功')
      this.getRolesList()
      this.setRightDialogVisable = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>