<template>
  <el-container class="main-body">
    <el-aside width="260px">
      <div class="search">
        <!-- <el-input size="mini" placeholder="请输入内容" suffix-icon="el-icon-search" v-model="text"></el-input> -->
        <el-select
          size="mini"
          v-model="addUserId"
          filterable
          remote
          reserve-keyword
          placeholder="输入账号添加好友"
          :remote-method="remoteMethod"
          :loading="loading"
        >
          <el-option
            v-for="item in options"
            :key="item.userId"
            :label="item.name"
            :value="item.userId"
          ></el-option>
        </el-select>
        <el-button size="mini" @click="addFriends" icon="el-icon-plus"></el-button>
      </div>
      <div class="friends-list">
        <li @click="tab_group()" :class="{active:active_id===''}">
          <span>
            聊天室
            <em v-if="group_count>0">{{group_count}}</em>
          </span>
        </li>
        <li
          v-for="item in friendsData"
          :class="{active:active_id===item.userId}"
          @click="tab_user(item)"
        >
          <span>
            {{item.name}}
            <em v-if="item.count>0">{{item.count}}</em>
          </span>
        </li>
      </div>
    </el-aside>
    <el-container>
      <el-header height="50px">{{name}}</el-header>
      <el-main>
        <div class="chat-message" id="scroll">
          <div class="list" id="list">
            <ul v-for="item in message">
              <template v-if="item.send_user_id===userData.userId">
                <li class="own">
                  <span class="name">{{item.name}}</span>
                  <p>{{item.message}}</p>
                </li>
              </template>
              <template v-else>
                <li class="other">
                  <div class="name">{{item.name}}</div>
                  <p>{{item.message}}</p>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </el-main>
      <el-footer height="auto">
        <div class="chat-send-message">
          <textarea placeholder="请输入内容..." v-model="msg" @keyup.enter="send"></textarea>
          <div class="chat-message-but">
            <!-- <button type="button" @click="send">发送</button> -->
          </div>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "",
      message: [],
      userData: JSON.parse(localStorage.getItem("userData")),
      name: JSON.parse(localStorage.getItem("userData")).name,
      text: "",
      friendsData: [],
      addUserId: "",
      loading: false,
      options: [],
      type: "group",
      active_id: "",
      friends_id: "",
      group_count: 0
    };
  },
  methods: {
    init: function() {
      if (typeof WebSocket === "undefined") {
        alert("您的浏览器不支持socket");
      } else {
        const userData = JSON.parse(localStorage.getItem("userData"));
        // 实例化socket
        this.socket = new WebSocket(
          "ws://122.51.239.179:3001/wss?userId=" + userData.userId
        );
        // 监听socket连接
        this.socket.onopen = this.open;
        // 监听socket错误信息
        this.socket.onerror = this.error;
        // 监听socket消息
        this.socket.onmessage = this.getMessage;
      }
    },
    open: function() {
      this.getFriends();
      this.tab_group();
    },
    error: function() {
      alert("连接失败！！");
    },
    getMessage: function(msg) {
      msg = JSON.parse(msg.data);
      if (msg.type === "private") {
        if (
          this.active_id === msg.send_user_id ||
          this.userData.userId === msg.send_user_id
        ) {
          this.message.push(msg);
          this.$nextTick(() => {
            let h = document.getElementById("list").clientHeight;
            document.getElementById("scroll").scrollTop = h;
          });
        } else {
          this.$notify({
            title: msg.name,
            message: msg.message
          });
          this.friendsData.forEach(item => {
            if (item.userId === msg.send_user_id) {
              item.count++;
            }
          });
        }
      } else if (msg.type === "group") {
        if (this.active_id != "") {
          this.group_count++;
          this.$notify({
            title: "聊天室",
            message: msg.name + ":" + msg.message
          });
        } else {
          this.message.push(msg);
          this.$nextTick(() => {
            let h = document.getElementById("list").clientHeight;
            document.getElementById("scroll").scrollTop = h;
          });
        }
      } else if (msg.type === "add") {
        this.getFriends();
        this.$notify({
          title: "好友通知",
          message: msg.name + "已添加您为好友！"
        });
      }
    },
    send: function() {
      this.socket.send(
        JSON.stringify({
          text: this.msg,
          name: this.userData.name,
          friendsId: this.friends_id,
          userId: this.userData.userId,
          receive: this.active_id,
          type: this.type
        })
      );
      this.msg = "";
    },
    close: function() {},
    getFriends() {
      const params = {
        userId: this.userData.userId
      };
      this.api.getFriends(params).then(res => {
        if (res.data.code === 200) {
          this.friendsData = res.data.data.map(item => {
            item.count = 0;
            return item;
          });
        } else {
          this.$message.error("查询失败");
        }
      });
    },
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        const params = {
          username: query
        };
        this.api.getUser(params).then(res => {
          if (res.data.code === 200) {
            this.loading = false;
            this.options = res.data.data;
          }
        });
      } else {
        this.options = [];
      }
    },
    addFriends() {
      if (this.addUserId === "") {
        this.$message.warning("请先选择好友");
        return;
      }
      const params = {
        active_id: this.userData.userId,
        passive_id: this.addUserId
      };
      this.api.addFriends(params).then(res => {
        if (res.data.code === 200) {
          this.getFriends();
          this.$message.success("添加成功");
          this.socket.send(
            JSON.stringify({
              userId: this.addUserId,
              name: this.name,
              type: "add"
            })
          );
        } else {
          this.$message.error("添加失败");
        }
      });
    },
    tab_user(item, type) {
      this.active_id = item.userId;
      this.friends_id = item.friends_id;
      this.type = "private";
      const params = {
        friendsId: item.friends_id
      };
      this.api.getPersonalMsg(params).then(res => {
        if (res.data.code === 200) {
          this.message = res.data.data;
          this.$nextTick(() => {
            let h = document.getElementById("list").clientHeight;
            document.getElementById("scroll").scrollTop = h;
          });
          item.count = 0;
        } else {
          this.message = [];
          this.$message.error("消息记录获取失败");
        }
      });
    },
    tab_group() {
      this.active_id = "";
      this.friends_id = "";
      this.type = "group";
      this.api.getGroupMsg().then(res => {
        if (res.data.code === 200) {
          this.message = res.data.data;
          this.$nextTick(() => {
            let h = document.getElementById("list").clientHeight;
            document.getElementById("scroll").scrollTop = h;
            this.group_count = 0;
          });
        } else {
          this.$message.error("消息记录获取失败");
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
ul,
li {
  list-style: none;
}

.main-body {
  max-width: 1200px;
  margin: 50px auto 0 auto;
  border: 1px solid #dbdbdc;
  height: calc(100vh - 200px);
  min-height: 400px;
  background-color: #f0f0f0;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 1px 4px 0px;

  .el-aside {
    border-right: 1px solid #dbdbdc;
    display: flex;
    flex-direction: column;
    .search {
      height: 50px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      line-height: 49px;
      box-sizing: border-box;
      border-bottom: 1px solid #dbdbdc;

      .el-input {
        height: 28px;
        line-height: 28px;
      }

      .el-button {
        height: 28px;
        width: 28px;
        padding: 0;
        margin-left: 5px;
        cursor: pointer;
      }
    }
    .friends-list {
      flex: 1;
      background-color: #ffffff;

      li {
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        cursor: pointer;
        font-size: 0.875rem;
        border-bottom: 1px solid #dbdbdc;

        &[class="active"] {
          background-color: #c3c3c3;
        }

        span {
          line-height: 1;
          em {
            display: inline-block;
            width: 20px;
            height: 20px;
            font-size: 0.75rem;
            text-align: center;
            line-height: 20px;
            color: #ffffff;
            border-radius: 50%;
            background-color: #f2430d;
          }
        }
      }
    }
  }
  .el-header {
    line-height: 50px;
    border-bottom: 1px solid #dbdbdc;
  }

  .el-main {
    padding: 0;

    .chat-message {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
      border-bottom: none;

      .list {
        ul {
          padding: 0 20px;
          margin: 20px 0;

          li {
            display: flex;
            margin-bottom: 10px;

            p {
              font-size: 0.875rem;
              line-height: 30px;
              padding: 0 10px;
              max-width: 400px;
              border-radius: 4px;
              word-wrap: break-word;
              word-break: normal;
              box-sizing: border-box;
            }
            .name {
              font-size: 0.875rem;
              height: 30px;
              line-height: 30px;
            }
            &[class="own"] {
              flex-direction: row-reverse;

              .name {
                display: inline-block;
              }
              p {
                margin-right: 15px;
                color: #ffffff;
                background-color: #53da40;
              }
            }
            &[class="other"] {
              .name {
                display: inline-block;
              }
              p {
                margin-left: 15px;
                color: #000000;
                background-color: #ffffff;
              }
            }
          }
        }
      }
    }
  }
  .el-footer {
    padding: 0;

    .chat-send-message {
      border-top: 1px solid #dbdbdc;
      textarea {
        resize: none;
        width: 100%;
        height: 200px;
        border: none;
        padding: 8px;
        background-color: #f0f0f0;
        box-sizing: border-box;

        &:focus {
          border: none;
          outline: none !important;
        }
      }
      .chat-message-but {
        display: flex;
        button {
          width: 120px;
          height: 40px;
          margin-left: auto;
        }
      }
    }
  }
}
</style>
