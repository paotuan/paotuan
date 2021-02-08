<template>
  <div class="login-wrapper">
    <img class="logo" :src="logo"/>
    <el-form
        ref="login"
        :rules="rules"
        :model="form"
        label-width="0"
        style="width:100%;"
        @keydown.enter.native="submit"
    >
      <!-- 线上版本登录方式 -->
      <el-form-item prop="appid">
        <el-input v-model="form.appid" placeholder="请输入APPID" type="text" clearable/>
      </el-form-item>
      <el-form-item prop="secret">
        <el-input v-model="form.secret" placeholder="请输入secret" type="text" clearable/>
      </el-form-item>
      <el-form-item prop="userID">
        <el-input v-model="form.userID" placeholder="请输入用户名，推荐QQ号" type="text" clearable/>
      </el-form-item>
    </el-form>
    <el-button
        type="primary"
        @click="submit"
        style="width:100%; margin-top: 6px;"
    >登录
    </el-button>
  </div>
</template>
<script>
import { Form, FormItem } from 'element-ui'
import logo from '../../assets/image/logo.png'
import Cookies from 'js-cookie'

export default {
  name: 'Login',
  components: {
    ElForm: Form,
    ElFormItem: FormItem,
  },
  props: ['initialAppid', 'initialSecret'],
  data() {
    const checkUserID = (rule, value, callback) => {
      if (!/^[a-zA-Z0-9_]{3,23}$/.test(value)) {
        callback(new Error('不合法（字母开头+字母/数字，长度4-24)'))
      } else {
        callback()
      }
    }

    return {
      form: {
        appid: this.initialAppid,
        secret: this.initialSecret,
        userID: Cookies.get('uin'),
      },
      rules: {
        userID: [
          { required: true, message: '请输入 userID', trigger: 'blur' },
          { validator: checkUserID, trigger: 'blur' }
        ],
        appid: [{ required: true, message: '请输入 APPID', trigger: 'blur' }],
        secret: [{ required: true, message: '请输入 secret', trigger: 'blur' }]
      },
      logo: logo,
    }
  },
  methods: {
    submit() {
      this.$refs['login'].validate(valid => {
        if (valid) {
          this.$emit('submit', this.form)
        }
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
.login-wrapper
  display flex
  align-items center
  flex-direction column
  width 450px
  background $white
  color $black
  border-radius 5px
  box-shadow: 0 11px 20px 0 rgba(0, 0, 0, 0.3)

  .row-div
    display flex
    justify-content center
    align-items center
    flex-direction row

  .logo
    width 110px
    height 110px

  .loginBox
    width 320px
    margin 0 0 20px 0

    .send-code
      width 112px

    .login-im-btn
      width 100%

  .loginFooter
    color: #8c8a8ac7
    text-align: center
    padding: 0 0 20px 0
    cursor: pointer

.login-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 400px;
  padding: 20px 80px 50px;
  background: $white;
  color: $black;
  border-radius: 5px;
  box-shadow: 0 11px 20px 0 rgba(0, 0, 0, 0.3);

  .logo {
    width: 130px;
    height: 130px;
  }

  .register-button {
    width: 100%;
    margin: 6px 0 0 0;
  }

  .user-selector {
    width: 100%;
  }
}
</style>
