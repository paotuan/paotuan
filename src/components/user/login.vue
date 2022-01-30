<template>
  <div class="login-wrapper">
    <img class="logo" :src="logo"/>
    <el-form
        label-position="left" label-width="80px"
        ref="login"
        :rules="rules"
        :model="form"
        style="width:100%;"
        @keydown.enter.native="submit"
    >
      <!-- 线上版本登录方式 -->
      <el-form-item label="平台ID" prop="appid">
        <el-input v-model="form.appid" placeholder="请输入平台ID" type="text" clearable/>
      </el-form-item>
      <el-form-item label="Secret" prop="secret" style="margin-bottom: 0">
        <el-input v-model="form.secret" placeholder="请输入secret" show-password/>
      </el-form-item>
      <el-popover trigger="click" placement="right" width="300">
        <div class="popover">
          <div style="font-weight: bold">如果你是玩家：</div>
          <div>请向游戏主持人索取邀请链接，通过邀请链接在新窗口打开后，会自动填充平台 ID 和 secret。您无需关心它们的具体含义。</div>
          <br />
          <div style="font-weight: bold">如果你是主持人：</div>
          <div>您需要在<a href="https://console.cloud.tencent.com/im" target="_blank">腾讯云后台</a>获取这两个值。操作方法可见<a href="https://docs.qq.com/doc/DSW1TdXhhSmdpamRX" target="_blank">使用指南</a>中的【功能相关】章节。
          </div>
        </div>
        <a href="#" class="form-tip" slot="reference"><i class="el-icon-warning-outline" /> 平台 ID 和 secret 应该填什么？</a>
      </el-popover>
      <el-form-item label="QQ" prop="userID">
        <el-input v-model="form.userID" placeholder="请输入QQ号，请勿冒用" type="text" clearable/>
      </el-form-item>
    </el-form>
    <div style="display: flex;justify-content: space-between">
      <el-checkbox v-model="form.isRememberUin">记住帐号</el-checkbox>
      <el-checkbox v-model="form.isAutoLogin">自动登录</el-checkbox>
    </div>
    <el-button
        plain
        type="info"
        @click="submit"
        style="width:100%; margin-top: 6px;"
    >登录
    </el-button>
    <a href="https://docs.qq.com/doc/DSW1TdXhhSmdpamRX" target="_blank">使用指南与常见问题</a>
    <el-popover trigger="click">
      <img :src="minacode" />
      <a href="#" slot="reference">小程序版本</a>
    </el-popover>
  </div>
</template>
<script>
import {Form, FormItem, Popover} from 'element-ui'
import logo from '../../assets/image/logo.png'
import minacode from '../../assets/image/minacode.jpg'
import Cookies from 'js-cookie'

export default {
  name: 'Login',
  components: {
    ElForm: Form,
    ElFormItem: FormItem,
    ElPopover: Popover,
  },
  props: ['initialAppid', 'initialSecret'],
  data() {
    const checkUserID = (rule, value, callback) => {
      if (!/^[0-9]{5,15}$/.test(value)) {
        callback(new Error('格式不正确'))
      } else {
        callback()
      }
    }

    return {
      form: {
        appid: this.initialAppid,
        secret: this.initialSecret,
        userID: Cookies.get('uin'),
        isRememberUin: !!Cookies.get('uin'),
        isAutoLogin: Cookies.get('autologin') === 'true', // 注意 cookie 里的是 string，会把 'false' 当成 true
      },
      rules: {
        userID: [
          { required: true, message: '请输入 QQ', trigger: 'blur' },
          { validator: checkUserID, trigger: 'blur' }
        ],
        appid: [{ required: true, message: '请输入 APPID', trigger: 'blur' }],
        secret: [{ required: true, message: '请输入 secret', trigger: 'blur' }]
      },
      logo: logo,
      minacode: minacode,
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
.login-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 500px;
  padding: 20px 80px 50px;
  color: $black;
  margin-top -200px

  ::v-deep .el-form-item__label {
    color rgb(243, 243, 243)
    font-weight 500
  }

  .logo {
    /*height 400px*/
    width 50vw
  }

  .register-button {
    width: 100%;
    margin: 6px 0 0 0;
  }

  .user-selector {
    width: 100%;
  }
}

.el-button {
  margin-top 30px !important
}

::v-deep .el-checkbox__label {
  color rgb(243, 243, 243) !important
}

a, a:visited {
  color: rgb(243, 243, 243);
  font-size: 14px;
  margin-top 10px
}

.form-tip {
  margin-left: 80px;
  text-decoration: none;
  line-height: 30px;
}

.popover a {
  color #00A4FF
}
</style>
