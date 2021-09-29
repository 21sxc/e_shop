<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数"
                type="warning"
                :closable="false"
                show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys"
                       :options="cateList"
                       :props="cateProps"
                       @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 many表示获取的动态参数-->
        <el-tab-pane label="动态参数"
                     name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary"
                     size="mini"
                     :disabled="isBtnDisabled"
                     @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData"
                    border
                    stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals"
                        :key="i"
                        closable>{{item}}</el-tag>
                <!-- tag标签输入文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm"
                          @blur="handleInputConfirm">
                </el-input>
                <!-- tag标签输入文本框的按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 only表示获取的动态参数-->
        <el-tab-pane label="静态属性"
                     name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary"
                     size="mini"
                     :disabled="isBtnDisabled"
                     @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData"
                    border
                    stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+ titleText"
               :visible.sync="addDialogVisible"
               width="50%"
               @close="addDialogClose">
      <!-- 添加参数的表格 -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog :title="'添加'+ titleText"
               :visible.sync="editDialogVisible"
               width="50%"
               @close="editDialogClose">
      <!-- 修改参数的表格 -->
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //商品列表
      cateList: [],
      //级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //被激活的页签名称
      activeName: 'many',
      //动态参数
      manyTableData: [],
      //静态属性
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加参数的表单数据对象
      addForm: {},
      //添加表单的验证规则对象
      addFormRules: {
        attr_name: [{
          required: true, message: '请输入参数名称', trigger: 'blur'
        }]
      },
      //控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //修改参数的表单数据对象
      editForm: {},
      //修改表单的验证规则对象
      editFormRules: {
        attr_name: [{
          required: true, message: '请输入参数名称', trigger: 'blur'
        }]
      },
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //获取所有商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.cateList = res.data
    },
    //级联选择框选中项变化触发该函数
    handleChange () {
      this.getParamsDate()
    },
    //tab页签点击事件的处理函数
    handleTabClick () {
      this.getParamsDate()
    },
    //获取参数的列表数据
    async getParamsDate () {
      //如果选中的数组长度不为3，说明未选中三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }
      // console.log(this.selectedCateKeys);
      //根据所选分类的id和当前所在的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      //对attr_vals进行分割
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
				//控制文本框的显示与隐藏
				item.inputVisible = false
				//文本框中输入的值
				item.inputValue = ''
      })
      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //监听添加对话框的关闭事件
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮添加参数
    async addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsDate()
      })
    },
    //点击按钮展示修改对话框
    async showEditDialog (attr_id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //监听修改对话框的关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    //点击按钮修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    //点击按钮根据id删除参数
    async removeParams (attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      //通过删除接口，根据id删除参数
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsDate()
    },
		//文本框失去焦点或按下enter键触发
		handleInputConfirm(){
			console.log('ok');
		},
		//点击按钮展示文本输入框
		showInput(row){
			row.inputVisible = true
		},
  },
  computed: {
    //如果按钮需要被禁用，返回true，否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的分类id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //动态计算标题的title
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
	width: 120px;
}
</style>