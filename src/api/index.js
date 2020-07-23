import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '../axios/index'
const root = 'http://122.51.239.179:3000'
const api = {

    login(params) {
        return postRequest(root + '/user/login', params)
    },
    reg(params) {
        return postRequest(root + '/user/reg', params)
    },
    getFriends(params) {
        return getRequest(root + '/friends/friendsList', params)
    },
    getUser(params) {
        return getRequest(root + '/friends/searchUser', params)
    },
    addFriends(params) {
        return postRequest(root + '/friends/addFriends', params)
    },
    getPersonalMsg(params) {
        return getRequest(root + '/message/getPersonalMessage', params)
    },
    getGroupMsg(params) {
        return getRequest(root + '/message/getGroupMessage', params)
    }
}

export default api;