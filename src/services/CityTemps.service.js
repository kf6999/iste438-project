import axios from "axios";
import { SHOW, SHOW_ALL, COMMENT } from '../constants/routes.js';

// show route
export const show = (queries) => {
    return axios.get(`${SHOW}`).then(res => {
        return res.data;
    })
    .catch(err => {
        return err;
    })
}

// showall route
export const showAll = (query) => {
    console.log(query);
    if (query !== undefined) {
        return axios.get(`${SHOW_ALL}${query}`).then(res => {
            console.log(res);
            return res.data;
        })
        .catch(err => {
            return err;
        })
    } else {
        return axios.get(`${SHOW_ALL}`).then(res => {
            console.log(res);
            return res.data;
        })
        .catch(err => {
            return err;
        })
    }
}

// post comment route
export const addComment = (comment_info) => {
    return axios.post(COMMENT, comment_info).then(res => {
        return res.data;
    })
    .catch(err => {
        return err;
    });
}