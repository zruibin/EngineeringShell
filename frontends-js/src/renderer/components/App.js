import React from 'react'
import '../assets/css/App.css'
import logger from '../log'
import { Button, message as Message, notification } from 'antd';
import emitter from "../eventbus"

class App extends React.Component {
  constructor(props) {
    super(props);
    logger.info("App Load.");

    this.state = {
      title: "Hello, Engineering Shell!",
      detail: "I hope you enjoy using engineering shell to start your dev off right!"
    };

    // 为了在回调中使用 `this`，这个绑定是必不可少的
    this.info = this.info.bind(this);
    this.openNotification = this.openNotification.bind(this);
  }

  static getDerivedStateFromProps(props, state){
    logger.debug("执行getDerivedStateFromProps");
    return null;
  }

  componentDidMount(){
    logger.debug("执行componentDidMount");
    emitter.on("app", (arg) => {
      logger.debug("emitter.on:", arg);
    });
  }

  componentWillUnmount() {
    logger.debug("componentWillUnmount");
    emitter.off("app", null);
  }

  shouldComponentUpdate(nextProps, nextState) {
    logger.debug("shouldComponentUpdate");
    if (this.state.title !== nextState.title) {
      return true;
    }
    return false;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    logger.debug("getSnapshotBeforeUpdate");
    return null;
  }

  componentDidUpdate(prevProps, prevState){
    logger.debug("componentDidUpdate");
    if (prevState.title !== this.state.title) {
      logger.debug("state中的info数据改变了");
    }
  }
  
  info() {
    Message.info("Engineering Shell");
    logger.debug("Alert.");
    emitter.emit('app', "haha.");

    /*
    执行this.setState()并不总是立即更新组件，它会批量推迟更新。
    这使得在调用this.setState()后立即读取this.state成为了隐患。
    所以this.setState的第二个参数callback为可选的回调函数，在回调函数去读取更新后的state。
    */
    this.setState((state,props) => ({
      title: 'Hello, Electron And React!',
    }), () =>{
      logger.debug(this.state.title);
    });
  };

  openNotification() {
    notification.open({
      message: 'Notification Title',
      description:
        'I will never close automatically. This is a purposely very very long description that has many many characters and words.',
      duration: 3.5,
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  };

  render() {
    logger.debug("render");
    return (
      <div>
        <h1>{this.state.title}</h1>
        <p>{this.state.detail}</p>

        <Button type="primary" onClick={this.info}>Alert</Button>
        &nbsp;
        <Button type="primary" onClick={this.openNotification}>Notification</Button>
      </div>
    );
  }
}

export default App;