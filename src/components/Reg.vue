<template>
  <div class="login">
    <div class="login-form">
      <li class="login-label">注册</li>
      <el-form ref="form" :model="form" :rules="rulesForm" label-width="80px" label-position="top">
        <el-form-item prop="name">
          <el-input v-model="form.name" placeholder="昵称"></el-input>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="login-but" type="primary" @click="submit">注册</el-button>
        </el-form-item>
      </el-form>
      <li class="jump">
        <router-link :to="{name:'login'}" tag="span">马上登录</router-link>
      </li>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    return {
      form: {
        username: "",
        name: "",
        password: ""
      },
      rulesForm: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        name: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    reg() {
      const params = {
        username: this.form.username,
        name:this.form.name,
        password: this.form.password
      };
      this.api.reg(params).then(res => {
        if (res.data.code === 200) {
          localStorage.setItem("userData", JSON.stringify(res.data.data));
          this.$router.push({
            path: "/message"
          });
        } else {
          this.$message.error(res.data.message);
        }
      });
    },
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.reg();
        } else {
          return false;
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类

.login {
  display: flex;
  align-items: center;
  min-height: 100vh;
  .login-form {
    width: 320px;
    margin: 0 auto;
    padding-bottom: 80px;

    .login-label {
      font-size: 1.2rem;
      margin-bottom: 20px;
      text-align: center;
    }
    .login-but {
      width: 320px;
    }

    .jump {
      text-align: right;
      span {
        color: #0084ff;
        cursor: pointer;
        font-size: 0.75rem;
      }
    }
  }
}
</style>