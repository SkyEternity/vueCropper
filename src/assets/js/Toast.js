import { Message, MessageBox } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// element 一些js管理
const Toast = {
    // 提示消息
    MessageInfo(msg, type, duration) {
        Message({
            message: msg,
            type: type,
            duration: duration || 2000
        });
    },
    // 确定框
    MessageBox(content, callback) {
        MessageBox.alert(content,'提示', {
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            confirmButtonText: '确定',
			cancelButtonText: '取消', 
        }).then(() => {
            callback()
        }).catch(() => {});
    }
}

export default Toast
